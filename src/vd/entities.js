class entity_t {
	constructor(x, y, z, friction, sprite, init_param) {
		var t = this;
		t.x = x; t.y = y; t.z = z;
		t.vx = t.vy = t.vz = t.ax = t.ay = t.az = 0;
		t.f = friction;
		t.s = sprite;
		t.h = 5;
		t._init(init_param);
		entities.push(t);
	}

	_init(init_param) {}

	_update() {
		var t = this,
			last_x = t.x, last_z = t.z;

		t.vx += t.ax * time_elapsed - t.vx * _math.min(t.f * time_elapsed, 1);
		t.vy += t.ay * time_elapsed - t.vy * _math.min(t.f * time_elapsed, 1);
		t.vz += t.az * time_elapsed - t.vz * _math.min(t.f * time_elapsed, 1);

		t.x += t.vx * time_elapsed;
		t.y += t.vy * time_elapsed;
		t.z += t.vz * time_elapsed;

		if (t._collides(t.x, last_z)) {
			t._did_collide(t.x, t.y);
			t.x = last_x;
			t.vx = 0;
		}
		if (t._collides(t.x, t.z)) {
			t._did_collide(t.x, t.y);
			t.z = last_z;
			t.vz = 0;
		}
	}

	_collides(x, z) {
		var ix = (x >> 3), iz = (z >> 3);
		var ix2 = ((x + 6) >> 3), iz2 = ((z + 4) >> 3);
		if (ix < 0 || iz < 0 || ix2 >= level_width || iz2 >= level_height) return true;
		return level_data[ix + iz * level_width] > 7 ||
			level_data[ix2 + iz * level_width] > 7 ||
			level_data[ix2 + iz2 * level_width] > 7 ||
			level_data[ix + iz2 * level_width] > 7;
	}

	_spawn_particles(amount) {
		for (var i = 0; i < amount; i++) {
			var p = new entity_particle_t(this.x, 0, this.z, 1, 30);
			p.vx = (_math.random() - 0.5) * 128;
			p.vy = _math.random() * 96;
			p.vz = (_math.random() - 0.5) * 128;
		}
	}

	_did_collide() {}
	_check(other) {}

	_receive_damage(from, amount) {
		this.h -= amount;
		if (this.h <= 0) this._kill();
	}

	_kill() {
		if (!this._dead) {
			this._dead = true;
			entities_to_kill.push(this);
		}
	}

	_render() {
		push_sprite(this.x - 1, this.y, this.z, this.s);
	}
}


class entity_player_t extends entity_t {
	_init() {
		this._bob = this._last_shot = this._last_damage = this._frame = 0;
		this._dash_cooldown = 0;
		this._dashing = 0;
		this.combo = 1;
		this.combo_timer = 0;
		this.score = 0;
		this.kills = 0;
		this.h = player_max_hp;
	}

	_collides(x, z) {
		if (super._collides(x, z)) return true;
		if (locked_room_idx >= 0 && rooms[locked_room_idx]) {
			var r = rooms[locked_room_idx];
			var ix1 = x >> 3, iz1 = z >> 3;
			var ix2 = (x + 6) >> 3, iz2 = (z + 4) >> 3;
			if (ix1 < r.x || ix2 >= r.x + r.w || iz1 < r.y || iz2 >= r.y + r.h) {
				return true;
			}
		}
		return false;
	}

	_update() {
		var t = this,
			speed = 128 * player_speed_mult;

		t._dash_cooldown -= time_elapsed;
		if (t._dashing > 0) {
			t._dashing -= time_elapsed;
			speed = 400 * player_speed_mult;
		}

		if (keys[key_dash] && t._dash_cooldown <= 0 && t._dashing <= 0) {
			t._dashing = 0.2;
			t._dash_cooldown = 1.5 * player_dash_cd_mult;
			audio_play(audio_sfx_dash);
		}

		t.ax = keys[key_left] ? -speed : keys[key_right] ? speed : 0;
		t.az = keys[key_up] ? -speed : keys[key_down] ? speed : 0;

		var angle = _math.atan2(
			mouse_y - (-34 + c.height * 0.8),
			mouse_x - (t.x + 6 + camera_x + c.width * 0.5)
		);
		t.s = 18 + ((angle / _math.PI * 4 + 10.5) % 8) | 0;

		t._bob += time_elapsed * 1.75 * (_math.abs(t.vx) + _math.abs(t.vz));
		t.y = _math.sin(t._bob) * 0.25;

		t._last_damage -= time_elapsed;
		t._last_shot -= time_elapsed;

		if (t.combo_timer > 0) {
			t.combo_timer -= time_elapsed;
			if (t.combo_timer <= 0) t.combo = 1;
		}

		// ataque usando arma atual (melee ou ranged)
		var wp = weapon_defs[current_weapon];
		if (keys[key_shoot] && t._last_shot < 0) {
			audio_play(audio_sfx_shoot);
			if (wp.type === 'melee') {
				for (var i = 0; i < entities.length; i++) {
					var en = entities[i];
					if (en._dead) continue;
					if (!(en instanceof entity_seeker_t ||
						en instanceof entity_shooter_t ||
						en instanceof entity_bomber_t ||
						en instanceof entity_boss_t)) continue;
					var dxx = (en.x + 3) - (t.x + 3);
					var dzz = (en.z + 2) - (t.z + 2);
					var dist = _math.sqrt(dxx * dxx + dzz * dzz);
					if (dist > wp.range) continue;
					var enang = _math.atan2(dzz, dxx);
					var diff = _math.atan2(_math.sin(enang - angle), _math.cos(enang - angle));
					if (_math.abs(diff) > wp.arc) continue;
					en._receive_damage({
						vx: _math.cos(angle) * wp.knockback,
						vz: _math.sin(angle) * wp.knockback
					}, wp.dmg * player_dmg_mult);
					audio_play(audio_sfx_hit);
				}
				new entity_slash_t(
					t.x + _math.cos(angle) * 8,
					0,
					t.z + _math.sin(angle) * 8,
					0, 26, angle
				);
			} else {
				var shots = wp.shots || 1;
				for (var si = 0; si < shots; si++) {
					var spread_offset = (shots > 1) ? (si - (shots-1)/2) * 0.15 : 0;
					new entity_plasma_t(t.x, 0, t.z, 0, 26,
						angle + (_math.random() - 0.5) * wp.spread + spread_offset,
						wp.speed, wp.dmg * player_dmg_mult);
				}
			}
			t._last_shot = wp.rate * player_rate_mult;
		}

		super._update();
	}

	_render() {
		this._frame++;
		if ((this._last_damage < 0 && this._dashing <= 0) || this._frame % 6 < 4) {
			super._render();
		}
		push_light(this.x, 4, this.z + 6, 0.3, 1, 0.8, 0.015);
	}

	_kill() {
		super._kill();
		this.y = 10;
		this.z += 5;
		setTimeout(show_gameover_screen, 1500);
	}

	_receive_damage(from, amount) {
		if (this._last_damage < 0 && this._dashing <= 0) {
			audio_play(audio_sfx_hurt);
			super._receive_damage(from, amount);
			this._last_damage = 1.2;
			this.combo = 1;
			this.combo_timer = 0;
			camera_shake = 2;
			damage_flash = 1;
		}
	}

	_add_kill_score(base_score) {
		this.kills++;
		this.score += base_score * this.combo;
		this.combo = _math.min(this.combo + 1, 4);
		this.combo_timer = 3;
	}
}


class entity_seeker_t extends entity_t {
	_init() {
		this._anim = 0;
		this._retarget = 0;
		this._target_x = this.x;
		this._target_z = this.z;
		this.h = 3;
	}

	_update() {
		var t = this,
			txd = t.x - t._target_x,
			tzd = t.z - t._target_z,
			xd = t.x - entity_player.x,
			zd = t.z - entity_player.z,
			dist = _math.sqrt(xd * xd + zd * zd);

		t._retarget -= time_elapsed;
		if (t._retarget < 0 && dist < 80) {
			t._retarget = _math.random() * 0.4 + 0.25;
			t._target_x = entity_player.x;
			t._target_z = entity_player.z;
		}

		t.ax = _math.abs(txd) > 2 ? (txd > 0 ? -160 : 160) : 0;
		t.az = _math.abs(tzd) > 2 ? (tzd > 0 ? -160 : 160) : 0;

		super._update();
		this._anim += time_elapsed;
		this.s = 27 + ((this._anim * 15) | 0) % 3;
	}

	_receive_damage(from, amount) {
		super._receive_damage(from, amount);
		this.vx = from.vx;
		this.vz = from.vz;
		this._spawn_particles(5);
	}

	_check(other) {
		if (other instanceof entity_seeker_t) {
			var axis = (_math.abs(other.x - this.x) > _math.abs(other.z - this.z) ? 'x' : 'z'),
				sep = this[axis] > other[axis] ? 0.6 : -0.6;
			this['v' + axis] += sep;
			other['v' + axis] -= sep;
		} else if (other instanceof entity_player_t) {
			this.vx *= -1.5;
			this.vz *= -1.5;
			other._receive_damage(this, 1);
		}
	}

	_kill() {
		super._kill();
		new entity_explosion_t(this.x, 0, this.z, 0, 26);
		camera_shake = 1;
		audio_play(audio_sfx_explode);
		entity_player._add_kill_score(100);
	}
}


class entity_shooter_t extends entity_t {
	_init() {
		this._retarget = 0;
		this._target_x = this.x;
		this._target_z = this.z;
		this.h = 5;
	}

	_update() {
		var t = this,
			txd = t.x - t._target_x,
			tzd = t.z - t._target_z,
			xd = t.x - entity_player.x,
			zd = t.z - entity_player.z,
			dist = _math.sqrt(xd * xd + zd * zd);

		t._retarget -= time_elapsed;

		if (t._retarget < 0) {
			if (dist < 64) {
				t._retarget = _math.random() * 0.5 + 0.4;
				t._target_x = entity_player.x;
				t._target_z = entity_player.z;
			}
			if (dist < 56) {
				var ang = _math.atan2(entity_player.z - this.z, entity_player.x - this.x);
				new entity_enemy_plasma_t(t.x, 0, t.z, 0, 33, ang + _math.random() * 0.2 - 0.1);
			}
		}

		if (dist > 24) {
			t.ax = _math.abs(txd) > 2 ? (txd > 0 ? -56 : 56) : 0;
			t.az = _math.abs(tzd) > 2 ? (tzd > 0 ? -56 : 56) : 0;
		} else {
			t.ax = t.az = 0;
		}

		super._update();
	}

	_receive_damage(from, amount) {
		super._receive_damage(from, amount);
		this.vx = from.vx * 0.1;
		this.vz = from.vz * 0.1;
		this._spawn_particles(3);
	}

	_kill() {
		super._kill();
		new entity_explosion_t(this.x, 0, this.z, 0, 26);
		camera_shake = 3;
		audio_play(audio_sfx_explode);
		entity_player._add_kill_score(200);
	}
}


class entity_bomber_t extends entity_t {
	_init() {
		this._anim = 0;
		this._fuse = -1;
		this.h = 2;
	}

	_update() {
		var t = this,
			xd = t.x - entity_player.x,
			zd = t.z - entity_player.z,
			dist = _math.sqrt(xd * xd + zd * zd);

		if (t._fuse < 0) {
			if (dist < 80) {
				t.ax = xd > 0 ? -100 : 100;
				t.az = zd > 0 ? -100 : 100;
			}
			if (dist < 18) t._fuse = 1.1;
		} else {
			t._fuse -= time_elapsed;
			t.ax = t.az = 0;
			if (t._fuse <= 0) t._explode();
		}

		this._anim += time_elapsed;
		super._update();
	}

	_render() {
		super._render();
		if (this._fuse > 0) {
			var pulse = 0.02 + _math.sin(this._anim * 20) * 0.02;
			push_light(this.x, 4, this.z + 6, 1.5, 0.3, 0, pulse);
		} else {
			push_light(this.x, 4, this.z + 6, 0.8, 0.4, 0, 0.06);
		}
	}

	_explode() {
		var xd = this.x - entity_player.x,
			zd = this.z - entity_player.z,
			dist = _math.sqrt(xd * xd + zd * zd);
		if (dist < 24) entity_player._receive_damage(this, 1);
		this._spawn_particles(15);
		new entity_explosion_t(this.x, 0, this.z, 0, 26);
		camera_shake = 4;
		audio_play(audio_sfx_explode);
		entity_player._add_kill_score(150);
		this._kill();
	}

	_kill() {
		if (!this._dead) {
			super._kill();
			if (this._fuse < 0) {
				new entity_explosion_t(this.x, 0, this.z, 0, 26);
				camera_shake = 1;
				audio_play(audio_sfx_explode);
				entity_player._add_kill_score(150);
			}
		}
	}

	_receive_damage(from, amount) {
		super._receive_damage(from, amount);
		this.vx = from.vx * 0.5;
		this.vz = from.vz * 0.5;
		this._spawn_particles(3);
	}
}


// nucleo - boss do andar 3
class entity_boss_t extends entity_t {
	_init() {
		this.h = 50;
		this._phase = 1;
		this._attack_timer = 0;
		this._anim = 0;
		this._spawn_timer = 0;
	}

	_update() {
		var t = this,
			xd = t.x - entity_player.x,
			zd = t.z - entity_player.z;

		t._anim += time_elapsed;
		t._attack_timer -= time_elapsed;

		if (t.h <= 25 && t._phase === 1) {
			t._phase = 2;
			camera_shake = 8;
		}

		if (t._phase === 1) {
			if (t._attack_timer <= 0) {
				t._attack_timer = 0.35;
				var base_angle = t._anim * 2;
				for (var i = 0; i < 5; i++) {
					new entity_enemy_plasma_t(t.x, 0, t.z, 0, 33,
						base_angle + (i / 5) * _math.PI * 2);
				}
			}
			t.ax = _math.abs(xd) > 4 ? (xd > 0 ? -25 : 25) : 0;
			t.az = _math.abs(zd) > 4 ? (zd > 0 ? -25 : 25) : 0;
		} else {
			t._spawn_timer -= time_elapsed;
			if (t._spawn_timer <= 0) {
				t._spawn_timer = 3.0;
				var s1 = new entity_seeker_t(t.x + 16, 0, t.z, 5, 27);
				var s2 = new entity_seeker_t(t.x - 16, 0, t.z, 5, 27);
				s1._room_idx = s2._room_idx = t._room_idx;
			}
			t.ax = xd > 0 ? -100 : 100;
			t.az = zd > 0 ? -100 : 100;

			if (t._attack_timer <= 0) {
				t._attack_timer = 0.7;
				var ang = _math.atan2(entity_player.z - t.z, entity_player.x - t.x);
				new entity_enemy_plasma_t(t.x, 0, t.z, 0, 33, ang);
			}
		}

		super._update();
	}

	_render() {
		super._render();
		var pulse = _math.sin(this._anim * 4) * 0.01;
		var r = this._phase === 1 ? 0.8 : 1.5;
		var g = this._phase === 1 ? 0.2 : 0.1;
		push_light(this.x, 6, this.z + 6, r, g, 0.8, 0.01 + pulse);
	}

	_check(other) {
		if (other instanceof entity_player_t) {
			other._receive_damage(this, 2);
			this.vx *= -0.5;
			this.vz *= -0.5;
		}
	}

	_receive_damage(from, amount) {
		super._receive_damage(from, amount);
		this.vx = from.vx * 0.05;
		this.vz = from.vz * 0.05;
		this._spawn_particles(5);
	}

	_kill() {
		super._kill();
		for (var i = 0; i < 5; i++) {
			new entity_explosion_t(
				this.x + (_math.random() - 0.5) * 20, 0,
				this.z + (_math.random() - 0.5) * 20, 0, 26
			);
		}
		this._spawn_particles(30);
		camera_shake = 10;
		audio_play(audio_sfx_explode);
		entity_player._add_kill_score(1000);
		setTimeout(game_victory, 2000);
	}
}


class entity_plasma_t extends entity_t {
	_init(angle, spd, dmg) {
		var speed = spd || 96;
		this.vx = _math.cos(angle) * speed;
		this.vz = _math.sin(angle) * speed;
		this._dmg = dmg || 1;
	}

	_render() {
		super._render();
		push_light(this.x, 4, this.z + 6, 0, 0.9, 0.8, 0.04);
	}

	_did_collide() { this._kill(); }

	_check(other) {
		if (other instanceof entity_seeker_t || other instanceof entity_shooter_t ||
			other instanceof entity_bomber_t || other instanceof entity_boss_t) {
			audio_play(audio_sfx_hit);
			other._receive_damage(this, this._dmg);
			this._kill();
		}
	}
}


class entity_enemy_plasma_t extends entity_t {
	_init(angle) {
		this.vx = _math.cos(angle) * 75;
		this.vz = _math.sin(angle) * 75;
	}

	_render() {
		super._render();
		push_light(this.x, 4, this.z + 6, 1.5, 0.2, 0.1, 0.04);
	}

	_did_collide() { this._kill(); }

	_check(other) {
		if (other instanceof entity_player_t) {
			other._receive_damage(this, 1);
			this._kill();
		}
	}
}


class entity_explosion_t extends entity_t {
	_init() { this._lifetime = 1; }

	_update() {
		super._update();
		this._lifetime -= time_elapsed;
		if (this._lifetime < 0) this._kill();
	}

	_render() {
		push_light(this.x, 4, this.z + 6, 1, 0.7, 0.3, 0.08 * (1 - this._lifetime));
	}
}

class entity_slash_t extends entity_t {
	_init(angle) {
		this._angle = angle || 0;
		this._lifetime = 0.18;
		for (var i = 0; i < 8; i++) {
			var p = new entity_particle_t(this.x, 0, this.z, 1, 30);
			p.vx = _math.cos(this._angle) * 96 + (_math.random() - 0.5) * 80;
			p.vz = _math.sin(this._angle) * 96 + (_math.random() - 0.5) * 80;
			p.vy = _math.random() * 48;
		}
	}

	_update() {
		this._lifetime -= time_elapsed;
		if (this._lifetime < 0) this._kill();
	}

	_render() {
		var t = this._lifetime / 0.18;
		push_light(this.x, 4, this.z + 6, 1.5 * t, 1.5 * t, 2 * t, 0.06);
	}
}

class entity_particle_t extends entity_t {
	_init() { this._lifetime = 3; }

	_update() {
		this.ay = -320;
		if (this.y < 0) { this.y = 0; this.vy = -this.vy * 0.96; }
		super._update();
		this._lifetime -= time_elapsed;
		if (this._lifetime < 0) this._kill();
	}
}

class entity_health_t extends entity_t {
	_init() {
		this._anim = 0;
	}

	_check(other) {
		if (other instanceof entity_player_t && player_potions < 1) {
			player_potions = 1;
			other.score += 100;
			this._kill();
			audio_play(audio_sfx_pickup);
		}
	}

	_render() {
		super._render();
		this._anim += time_elapsed;
		var pulse = 0.025 + _math.sin(this._anim * 4) * 0.015;
		push_light(this.x, 4, this.z + 6, 0.1, 1.6, 0.2, pulse);
	}
}

class entity_weapon_t extends entity_t {
	_init() {
		this._anim = 0;
		this._weapon_id = random_int(0, weapon_defs.length - 1);
		// nao dar a mesma arma que o jogador ja tem
		if (this._weapon_id === current_weapon) {
			this._weapon_id = (this._weapon_id + 1) % weapon_defs.length;
		}
	}

	_render() {
		super._render();
		this._anim += time_elapsed;
		var pulse = 0.02 + _math.sin(this._anim * 4) * 0.01;
		push_light(this.x, 4, this.z + 6, 0, 0.8, 1.0, pulse);
	}

	_check(other) {
		if (other instanceof entity_player_t) {
			current_weapon = this._weapon_id;
			other.score += 100;
			audio_play(audio_sfx_pickup);
			terminal_show_notice('ARMA: ' + weapon_defs[current_weapon].name);
			this._kill();
		}
	}
}

class entity_staircase_t extends entity_t {
	_init() {
		this._anim = 0;
		this._active = false;
	}

	activate() { this._active = true; }

	_render() {
		this._anim += time_elapsed;
		if (this._active) {
			var pulse = 0.02 + _math.sin(this._anim * 5) * 0.01;
			push_light(this.x + 4, 4, this.z + 12, 0.5, 0.8, 1.0, pulse);
		}
	}

	_check(other) {
		if (this._active && other instanceof entity_player_t) {
			this._active = false;
			show_shop();
		}
	}
}
