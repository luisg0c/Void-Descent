var keys = {37: 0, 38: 0, 39: 0, 40: 0, 32: 0},
	key_up = 38, key_down = 40, key_left = 37, key_right = 39,
	key_shoot = 512, key_dash = 32,
	key_convert = {65: 37, 87: 38, 68: 39, 83: 40},
	mouse_x = 0, mouse_y = 0,

	time_elapsed,
	time_last = performance.now(),
	time_start = 0,

	current_level = 0,
	entity_player,
	entities = [],
	entities_to_kill = [],

	enemies_alive = 0,
	staircase_entity = null,
	game_state = 'title',
	damage_flash = 0,

	// paleta por andar [r, g, b] como multiplicador
	floor_palettes = [
		null,
		[0.2, 0.9, 1.0],  // andar 1: ciano
		[1.0, 0.7, 0.1],  // andar 2: laranja
		[0.9, 0.1, 0.9]   // andar 3: magenta
	],

	// armas disponiveis (GDD 2.3.3: pool fixo de 8, melee + ranged)
	weapon_defs = [
		// ranged
		{name:'PULSO',     type:'ranged', dmg:1, rate:0.10, speed:96,  spread:0.2,  color:'#0ff'},
		{name:'DISPERSAO', type:'ranged', dmg:1, rate:0.30, speed:80,  spread:0.8,  color:'#0f0', shots:3},
		{name:'PERFURAR',  type:'ranged', dmg:3, rate:0.50, speed:140, spread:0.05, color:'#f0f'},
		{name:'RAPIDO',    type:'ranged', dmg:1, rate:0.06, speed:110, spread:0.3,  color:'#ff0'},
		// melee
		{name:'LAMINA',    type:'melee',  dmg:2, rate:0.25, range:18, arc:0.7,  knockback:120, color:'#fcc'},
		{name:'MARTELO',   type:'melee',  dmg:5, rate:0.70, range:16, arc:0.9,  knockback:240, color:'#fa0'},
		{name:'ELETRO',    type:'melee',  dmg:1, rate:0.10, range:14, arc:0.5,  knockback:60,  color:'#0ff'},
		{name:'LANCA',     type:'melee',  dmg:3, rate:0.40, range:24, arc:0.35, knockback:140, color:'#f4f'}
	],
	current_weapon = 0,

	// estado de upgrade do jogador (resetado a cada nova run)
	player_max_hp = 5,
	player_dmg_mult = 1,
	player_speed_mult = 1,
	player_dash_cd_mult = 1,
	player_rate_mult = 1,
	player_potions = 0,

	// pool disponivel na run atual (upgrades comprados sao removidos)
	available_pool = null,
	offered_upgrades = [],

	// narrativa por andar
	floor_intros = [
		null,
		{name: 'ANTECAMARA',  lore: 'PRIMEIRO ANEL DE CONTENCAO\nFORMAS DE VIDA: HOSTIS'},
		{name: 'SUBSISTEMAS', lore: 'CAMADA DE AUTOMACAO\nFALHA EM CASCATA DETECTADA'},
		{name: 'NUCLEO',      lore: 'ULTIMO PERIMETRO\nFONTE DA CORRUPCAO'}
	],

	// definicoes de upgrade disponiveis
	upgrade_pool = [
		{id:'reparo',    name:'REPARO',     desc:'+1 HP MAX\nVIDA CHEIA',  cost:1200, color:'#f55', rgb:'255,85,85',
		 apply:function(){ player_max_hp = _math.min(player_max_hp + 1, 8); entity_player.h = player_max_hp; }},
		{id:'overclock', name:'OVERCLOCK',  desc:'DASH 25%\nMAIS RAPIDO',  cost:1500, color:'#0ff', rgb:'0,255,255',
		 apply:function(){ player_dash_cd_mult *= 0.75; }},
		{id:'amplifier', name:'AMPLIFIER',  desc:'DANO\n+50%',             cost:2200, color:'#f0f', rgb:'255,0,255',
		 apply:function(){ player_dmg_mult *= 1.5; }},
		{id:'accel',     name:'ACELERADOR', desc:'VELOCIDADE\n+20%',       cost:1500, color:'#ff0', rgb:'255,255,0',
		 apply:function(){ player_speed_mult *= 1.2; }},
		{id:'cadence',   name:'CADENCIA',   desc:'CADENCIA\n+25%',         cost:1800, color:'#0f0', rgb:'0,255,0',
		 apply:function(){ player_rate_mult *= 0.8; }}
	],

	menu_buttons = [
		{label:'JOGAR',    y:95,  action:'play'},
		{label:'CREDITOS', y:115, action:'credits'},
		{label:'SAIR',     y:135, action:'quit'}
	],
	menu_selected_idx = 0,
	shop_selected_idx = 0,

	// lock-and-clear (GDD 3.1)
	locked_room_idx = -1,
	last_room_idx = -1,

	// spatial hash grid pra collision broadphase
	GRID_CELL = 16,
	GRID_W = 32,
	GRID_H = 32,
	grid = new Array(32 * 32);


var TILES_B64 = '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';

function hue2rgb(p, q, t) {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1/6) return p + (q - p) * 6 * t;
	if (t < 1/2) return q;
	if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	return p;
}

function tint_atlas(img, hue_shift) {
	var cv = _document.createElement('canvas');
	cv.width = img.width;
	cv.height = img.height;
	var ctx = cv.getContext('2d');
	ctx.drawImage(img, 0, 0);
	var data = ctx.getImageData(0, 0, cv.width, cv.height);
	var px = data.data;

	for (var i = 0; i < px.length; i += 4) {
		if (px[i+3] < 10) continue;
		var rn = px[i]/255, gn = px[i+1]/255, bn = px[i+2]/255;
		var mx = _math.max(rn, gn, bn), mn = _math.min(rn, gn, bn);
		var h, s, l = (mx + mn) / 2;

		if (mx === mn) { h = s = 0; }
		else {
			var d = mx - mn;
			s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
			if (mx === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
			else if (mx === gn) h = ((bn - rn) / d + 2) / 6;
			else h = ((rn - gn) / d + 4) / 6;
		}

		h = (h + hue_shift) % 1.0;
		s = _math.min(s * 1.4, 1.0);

		if (s === 0) {
			px[i] = px[i+1] = px[i+2] = (l * 255) | 0;
		} else {
			var q2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p2 = 2 * l - q2;
			px[i]   = (hue2rgb(p2, q2, h + 1/3) * 255) | 0;
			px[i+1] = (hue2rgb(p2, q2, h) * 255) | 0;
			px[i+2] = (hue2rgb(p2, q2, h - 1/3) * 255) | 0;
		}
	}

	ctx.putImageData(data, 0, 0);
	return cv;
}

var _tiles_img = null;
var floor_hue_shifts = [0, 0.55, 0.15, 0.75];

function regenerate_atlas(callback) {
	if (!_tiles_img) {
		_tiles_img = new Image();
		_tiles_img.onload = function() {
			var shifted = tint_atlas(_tiles_img, floor_hue_shifts[current_level] || 0.55);
			renderer_bind_image(shifted);
			callback && callback();
		};
		_tiles_img.src = 'data:image/png;base64,' + TILES_B64;
		return;
	}
	var shifted = tint_atlas(_tiles_img, floor_hue_shifts[current_level] || 0.55);
	renderer_bind_image(shifted);
	callback && callback();
}

function next_level() {
	if (current_level === 3) {
		show_victory_screen();
		return;
	}
	current_level++;
	game_state = 'loading';
	regenerate_atlas(function() {
		load_level(current_level);
	});
}

function load_level(id) {
	random_seed(0xBADC0DE1 + id);
	entities = [];
	entities_to_kill = [];
	num_verts = 0;
	num_lights = 0;
	enemies_alive = 0;
	staircase_entity = null;
	damage_flash = 0;
	locked_room_idx = -1;
	last_room_idx = -1;

	var generated_rooms = dungeon_generate(id);

	var prev_score = entity_player ? entity_player.score : 0;
	var prev_kills = entity_player ? entity_player.kills : 0;
	var start_room = generated_rooms[0];
	entity_player = new entity_player_t(start_room.cx * 8, 0, start_room.cy * 8, 5, 18);
	entity_player.score = prev_score;
	entity_player.kills = prev_kills;

	for (var i = 1; i < generated_rooms.length; i++) {
		var room = generated_rooms[i];
		if (room.type === 'boss') {
			var boss_e = new entity_boss_t(room.cx * 8, 0, room.cy * 8, 3, 35);
			boss_e._room_idx = i;
			enemies_alive++;
			continue;
		}

		// arma pickup na sala de bau, com pocao garantida ao lado
		if (room.type === 'chest') {
			new entity_weapon_t(room.cx * 8, 0, room.cy * 8, 5, 37);
			new entity_health_t((room.cx + 1) * 8, 0, room.cy * 8, 5, 31);
		}

		var qtd = 6 + id * 4 + random_int(0, 3);
		for (var j = 0; j < qtd; j++) {
			var ex = (room.x + random_int(1, room.w - 2)) * 8;
			var ez = (room.y + random_int(1, room.h - 2)) * 8;

			var e;
			if (id === 1) {
				e = new entity_seeker_t(ex, 0, ez, 5, 27);
			} else if (id === 2) {
				e = (random_int(0, 2) === 0)
					? new entity_shooter_t(ex, 0, ez, 3, 32)
					: new entity_seeker_t(ex, 0, ez, 5, 27);
			} else {
				var roll = random_int(0, 4);
				if (roll === 0) e = new entity_shooter_t(ex, 0, ez, 3, 32);
				else if (roll === 1) e = new entity_bomber_t(ex, 0, ez, 4, 34);
				else e = new entity_seeker_t(ex, 0, ez, 5, 27);
			}
			e._room_idx = i;
			enemies_alive++;
		}

		if (random_int(0, 1) === 0) {
			new entity_health_t(
				(room.x + random_int(1, room.w - 2)) * 8, 0,
				(room.y + random_int(1, room.h - 2)) * 8, 5, 31
			);
		}
	}

	var last_room = generated_rooms[generated_rooms.length - 1];
	if (last_room.type !== 'boss') {
		staircase_entity = new entity_staircase_t(last_room.cx * 8, 0, last_room.cy * 8, 5, 36);
	}

	camera_x = -entity_player.x;
	camera_y = -300;
	camera_z = -entity_player.z - 100;

	level_num_verts = num_verts;

	var info = floor_intros[id];
	terminal_show_notice(
		'ANDAR ' + id + ' :: ' + info.name + '\n' +
		info.lore + '\n' +
		'INIMIGOS DETECTADOS: ' + enemies_alive
	);

	for (var k in keys) keys[k] = 0;
	game_state = 'playing';
}

function game_victory() {
	if (game_state === 'victory') return;
	show_victory_screen();
}

function _reset_run() {
	current_level = 0;
	current_weapon = 0;
	player_max_hp = 5;
	player_dmg_mult = 1;
	player_speed_mult = 1;
	player_dash_cd_mult = 1;
	player_rate_mult = 1;
	player_potions = 0;
	available_pool = upgrade_pool.slice();
	entity_player = null;
	damage_flash = 0;
}

function start_run() {
	if (audio_ctx && audio_ctx.state === 'suspended') audio_ctx.resume();
	_reset_run();
	for (var k in keys) keys[k] = 0;
	bind_input();
	time_start = performance.now();
	terminal_hide();
	next_level();
}

function show_menu() {
	game_state = 'menu';
	for (var k in keys) keys[k] = 0;
	c.style.opacity = 1;
	terminal_hide();
	_document.onkeydown = handle_menu_keydown;
	_document.onkeyup = function(ev) { ev.preventDefault(); };
	_document.onmousedown = function() {};
	_document.onmouseup = function() {};
}

function handle_menu_keydown(ev) {
	if (audio_ctx && audio_ctx.state === 'suspended') audio_ctx.resume();
	var kc = ev.keyCode;
	if (kc === 38 || kc === 87) {
		menu_selected_idx = (menu_selected_idx + menu_buttons.length - 1) % menu_buttons.length;
		audio_play(audio_sfx_terminal);
		ev.preventDefault();
	} else if (kc === 40 || kc === 83) {
		menu_selected_idx = (menu_selected_idx + 1) % menu_buttons.length;
		audio_play(audio_sfx_terminal);
		ev.preventDefault();
	} else if (kc === 13 || kc === 32) {
		var b = menu_buttons[menu_selected_idx];
		audio_play(audio_sfx_beep);
		if (b.action === 'play') start_run();
		else if (b.action === 'credits') show_credits();
		else if (b.action === 'quit') show_quit();
		ev.preventDefault();
	}
}

function draw_menu() {
	hud_ctx.clearRect(0, 0, hud_canvas.width, hud_canvas.height);
	hud_ctx.fillStyle = '#000';
	hud_ctx.fillRect(0, 0, hud_canvas.width, hud_canvas.height);

	hud_ctx.textAlign = 'center';
	hud_ctx.fillStyle = '#0ff';
	hud_ctx.font = 'bold 22px monospace';
	hud_ctx.fillText('VOID DESCENT', 160, 50);

	hud_ctx.fillStyle = '#244';
	hud_ctx.fillRect(60, 60, 200, 1);

	hud_ctx.fillStyle = '#666';
	hud_ctx.font = '8px monospace';
	hud_ctx.fillText('REBOOT MANUAL DO NUCLEO', 160, 72);

	hud_ctx.font = 'bold 12px monospace';
	for (var i = 0; i < menu_buttons.length; i++) {
		var b = menu_buttons[i];
		var sel = i === menu_selected_idx;
		hud_ctx.fillStyle = sel ? '#0ff' : '#888';
		hud_ctx.fillText((sel ? '> ' : '  ') + b.label + (sel ? ' <' : ''), 160, b.y);
	}

	hud_ctx.fillStyle = '#555';
	hud_ctx.font = '8px monospace';
	hud_ctx.fillText('SETAS / W S  ::  ENTER / ESPACO  ::  [M] MUTE', 160, 158);
	hud_ctx.fillStyle = '#333';
	hud_ctx.fillText('ICEV / 2026', 160, 172);
}

function _bind_dismiss(action) {
	var open_at = performance.now();
	_document.onkeydown = function(ev) { ev.preventDefault(); };
	_document.onkeyup = function(ev) {
		ev.preventDefault();
		if (performance.now() - open_at < 300) return;
		action(ev);
	};
	_document.onmousedown = function(ev) { ev.preventDefault(); };
	_document.onmouseup = function(ev) {
		ev.preventDefault();
		if (performance.now() - open_at < 300) return;
		action(ev);
	};
}

function show_credits() {
	game_state = 'credits';
	_bind_dismiss(function() {
		audio_play(audio_sfx_beep);
		show_menu();
	});
}

function draw_credits() {
	hud_ctx.clearRect(0, 0, hud_canvas.width, hud_canvas.height);
	hud_ctx.fillStyle = '#000';
	hud_ctx.fillRect(0, 0, hud_canvas.width, hud_canvas.height);

	hud_ctx.textAlign = 'center';
	hud_ctx.fillStyle = '#0ff';
	hud_ctx.font = 'bold 14px monospace';
	hud_ctx.fillText('CREDITOS', 160, 25);

	hud_ctx.fillStyle = '#666';
	hud_ctx.font = '8px monospace';
	hud_ctx.fillText('UM JOGO POR', 160, 48);

	hud_ctx.fillStyle = '#fff';
	hud_ctx.font = '10px monospace';
	hud_ctx.fillText('LUIS GUSTAVO OLIMPIO', 160, 66);
	hud_ctx.fillText('LAUAN MATHEUS', 160, 80);
	hud_ctx.fillText('JOSE MELQUIADES', 160, 94);
	hud_ctx.fillText('JOAO LEONARDI', 160, 108);

	hud_ctx.fillStyle = '#666';
	hud_ctx.font = '8px monospace';
	hud_ctx.fillText('ICEV - INSTITUTO DE ENSINO SUPERIOR', 160, 138);
	hud_ctx.fillText('ENGINE: WEBGL CUSTOM / SONANT-X', 160, 152);

	hud_ctx.fillStyle = '#0ff';
	hud_ctx.fillText('CLIQUE PARA VOLTAR', 160, 170);
}

function show_quit() {
	game_state = 'quit';
	_bind_dismiss(function() {
		audio_play(audio_sfx_beep);
		show_menu();
	});
	try { window.close(); } catch (e) {}
}

function draw_quit() {
	hud_ctx.clearRect(0, 0, hud_canvas.width, hud_canvas.height);
	hud_ctx.fillStyle = '#000';
	hud_ctx.fillRect(0, 0, hud_canvas.width, hud_canvas.height);

	hud_ctx.textAlign = 'center';
	hud_ctx.fillStyle = '#f80';
	hud_ctx.font = 'bold 14px monospace';
	hud_ctx.fillText('SISTEMA DESLIGADO', 160, 70);

	hud_ctx.fillStyle = '#aaa';
	hud_ctx.font = '10px monospace';
	hud_ctx.fillText('OBRIGADO POR JOGAR', 160, 95);

	hud_ctx.fillStyle = '#666';
	hud_ctx.font = '8px monospace';
	hud_ctx.fillText('FECHE A ABA OU CLIQUE PARA VOLTAR', 160, 130);
}

function show_victory_screen() {
	game_state = 'victory';
	var elapsed = ((performance.now() - time_start) / 1000) | 0;
	var min = (elapsed / 60) | 0;
	var sec = elapsed % 60;

	hud_ctx.clearRect(0, 0, hud_canvas.width, hud_canvas.height);
	hud_ctx.fillStyle = 'rgba(0,0,0,0.85)';
	hud_ctx.fillRect(0, 0, hud_canvas.width, hud_canvas.height);

	hud_ctx.textAlign = 'center';
	hud_ctx.fillStyle = '#0ff';
	hud_ctx.font = 'bold 18px monospace';
	hud_ctx.fillText('VOID NEUTRALIZADO', 160, 40);

	hud_ctx.font = '10px monospace';
	hud_ctx.fillStyle = '#fff';
	hud_ctx.fillText('TEMPO: ' + min + ':' + (sec < 10 ? '0' : '') + sec, 160, 70);
	hud_ctx.fillText('KILLS: ' + entity_player.kills, 160, 85);
	hud_ctx.fillText('SCORE: ' + entity_player.score, 160, 100);
	hud_ctx.fillText('ARMA: ' + weapon_defs[current_weapon].name, 160, 115);

	hud_ctx.fillStyle = '#0f0';
	hud_ctx.fillText('PRESSIONE QUALQUER TECLA PARA VOLTAR AO MENU', 160, 150);

	_bind_dismiss(function() {
		audio_play(audio_sfx_beep);
		show_menu();
	});
}

function show_gameover_screen() {
	if (game_state === 'gameover' || game_state === 'victory') return;
	game_state = 'gameover';
	var elapsed = ((performance.now() - time_start) / 1000) | 0;
	var min = (elapsed / 60) | 0;
	var sec = elapsed % 60;

	hud_ctx.clearRect(0, 0, hud_canvas.width, hud_canvas.height);
	hud_ctx.fillStyle = 'rgba(0,0,0,0.8)';
	hud_ctx.fillRect(0, 0, hud_canvas.width, hud_canvas.height);

	hud_ctx.textAlign = 'center';
	hud_ctx.fillStyle = '#f44';
	hud_ctx.font = 'bold 18px monospace';
	hud_ctx.fillText('DEPLOYMENT FAILED', 160, 40);

	hud_ctx.font = '10px monospace';
	hud_ctx.fillStyle = '#fff';
	hud_ctx.fillText('ANDAR: ' + current_level, 160, 70);
	hud_ctx.fillText('KILLS: ' + (entity_player ? entity_player.kills : 0), 160, 85);
	hud_ctx.fillText('SCORE: ' + (entity_player ? entity_player.score : 0), 160, 100);
	hud_ctx.fillText('TEMPO: ' + min + ':' + (sec < 10 ? '0' : '') + sec, 160, 115);

	hud_ctx.fillStyle = '#f80';
	hud_ctx.font = 'bold 10px monospace';
	hud_ctx.fillText('[ENTER] TENTAR NOVAMENTE', 160, 145);
	hud_ctx.fillStyle = '#888';
	hud_ctx.font = '9px monospace';
	hud_ctx.fillText('[ESC] MENU PRINCIPAL', 160, 160);

	_bind_dismiss(function(ev) {
		audio_play(audio_sfx_beep);
		if (ev && ev.keyCode === 27) show_menu();
		else start_run();
	});
}

function show_shop() {
	staircase_entity = null;
	if (!available_pool || available_pool.length === 0) {
		proceed_to_next_level();
		return;
	}

	game_state = 'shop';
	for (var k in keys) keys[k] = 0;
	damage_flash = 0;
	shop_selected_idx = 0;

	var copy = available_pool.slice();
	offered_upgrades = [];
	for (var i = 0; i < 3 && copy.length > 0; i++) {
		var idx = (_math.random() * copy.length) | 0;
		offered_upgrades.push(copy[idx]);
		copy.splice(idx, 1);
	}

	_document.onkeydown = handle_shop_keydown;
	_document.onkeyup = function(ev) { ev.preventDefault(); };
	_document.onmousedown = function() {};
	_document.onmouseup = function() {};
}

function handle_shop_keydown(ev) {
	var kc = ev.keyCode;
	var n = offered_upgrades.length;
	if (kc === 37 || kc === 65) {
		shop_selected_idx = (shop_selected_idx + n - 1) % n;
		audio_play(audio_sfx_terminal);
		ev.preventDefault();
	} else if (kc === 39 || kc === 68) {
		shop_selected_idx = (shop_selected_idx + 1) % n;
		audio_play(audio_sfx_terminal);
		ev.preventDefault();
	} else if (kc === 13 || kc === 32) {
		var u = offered_upgrades[shop_selected_idx];
		if (entity_player.score >= u.cost) {
			entity_player.score -= u.cost;
			u.apply();
			audio_play(audio_sfx_pickup);
			var pool_idx = available_pool.indexOf(u);
			if (pool_idx >= 0) available_pool.splice(pool_idx, 1);
			proceed_to_next_level();
		} else {
			audio_play(audio_sfx_hit);
		}
		ev.preventDefault();
	} else if (kc === 27) {
		audio_play(audio_sfx_beep);
		proceed_to_next_level();
		ev.preventDefault();
	}
}

function proceed_to_next_level() {
	bind_input();
	keys[key_shoot] = 0;
	next_level();
}

function draw_shop() {
	hud_ctx.clearRect(0, 0, hud_canvas.width, hud_canvas.height);
	hud_ctx.fillStyle = 'rgba(0,0,0,0.85)';
	hud_ctx.fillRect(0, 0, hud_canvas.width, hud_canvas.height);

	hud_ctx.textAlign = 'center';
	hud_ctx.fillStyle = '#0ff';
	hud_ctx.font = 'bold 14px monospace';
	hud_ctx.fillText('SETOR PURGADO', 160, 22);

	hud_ctx.fillStyle = '#888';
	hud_ctx.font = '9px monospace';
	hud_ctx.fillText('TROCA DE NUCLEO :: SELECIONE UM UPGRADE', 160, 38);

	hud_ctx.textAlign = 'right';
	hud_ctx.fillStyle = '#ff0';
	hud_ctx.font = 'bold 10px monospace';
	hud_ctx.fillText('CREDITOS: ' + entity_player.score, 305, 50);

	for (var i = 0; i < offered_upgrades.length; i++) {
		var u = offered_upgrades[i];
		var bx = 20 + i * 100;
		var by = 55;
		var afford = entity_player.score >= u.cost;
		var sel = i === shop_selected_idx;

		hud_ctx.fillStyle = sel && afford ? 'rgba(' + u.rgb + ',0.20)' : 'rgba(20,20,30,0.5)';
		hud_ctx.fillRect(bx, by, 80, 80);

		hud_ctx.strokeStyle = !afford ? '#333' : (sel ? u.color : '#555');
		hud_ctx.lineWidth = sel ? 2 : 1;
		hud_ctx.strokeRect(bx + 0.5, by + 0.5, 79, 79);

		hud_ctx.textAlign = 'center';
		hud_ctx.fillStyle = afford ? u.color : '#555';
		hud_ctx.font = 'bold 10px monospace';
		hud_ctx.fillText(u.name, bx + 40, by + 16);

		hud_ctx.fillStyle = afford ? '#ddd' : '#444';
		hud_ctx.font = '8px monospace';
		var lines = u.desc.split('\n');
		for (var j = 0; j < lines.length; j++) {
			hud_ctx.fillText(lines[j], bx + 40, by + 36 + j * 11);
		}

		hud_ctx.fillStyle = afford ? '#ff0' : '#622';
		hud_ctx.font = 'bold 9px monospace';
		hud_ctx.fillText(u.cost + ' CR', bx + 40, by + 70);
	}

	hud_ctx.fillStyle = '#888';
	hud_ctx.font = '8px monospace';
	hud_ctx.fillText('< SETAS / A D >  COMPRAR: ENTER  PULAR: ESC', 160, 152);
	var u_sel = offered_upgrades[shop_selected_idx];
	if (u_sel && entity_player.score < u_sel.cost) {
		hud_ctx.fillStyle = '#f55';
		hud_ctx.fillText('CREDITOS INSUFICIENTES', 160, 166);
	}
}

function draw_loading() {
	hud_ctx.clearRect(0, 0, hud_canvas.width, hud_canvas.height);
	hud_ctx.fillStyle = '#000';
	hud_ctx.fillRect(0, 0, hud_canvas.width, hud_canvas.height);
	hud_ctx.textAlign = 'center';
	hud_ctx.fillStyle = '#0ff';
	hud_ctx.font = 'bold 12px monospace';
	hud_ctx.fillText('CARREGANDO...', 160, 95);
}

function count_enemies() {
	enemies_alive = 0;
	for (var i = 0; i < entities.length; i++) {
		var e = entities[i];
		if (!e._dead && (
			e instanceof entity_seeker_t ||
			e instanceof entity_shooter_t ||
			e instanceof entity_bomber_t ||
			e instanceof entity_boss_t
		)) {
			enemies_alive++;
		}
	}
	if (enemies_alive === 0 && staircase_entity && !staircase_entity._active) {
		staircase_entity.activate();
		terminal_show_notice('TODOS ELIMINADOS\nESCADA ATIVADA');
	}
}

function count_enemies_in_room(idx) {
	var count = 0;
	for (var i = 0; i < entities.length; i++) {
		var e = entities[i];
		if (e._dead || e._room_idx !== idx) continue;
		if (e instanceof entity_seeker_t ||
			e instanceof entity_shooter_t ||
			e instanceof entity_bomber_t ||
			e instanceof entity_boss_t) {
			count++;
		}
	}
	return count;
}

function check_room_lock() {
	if (!entity_player) return;

	if (locked_room_idx >= 0) {
		if (count_enemies_in_room(locked_room_idx) === 0) {
			locked_room_idx = -1;
			audio_play(audio_sfx_pickup);
			terminal_show_notice('SALA LIBERADA');
		}
		return;
	}

	var px1 = entity_player.x >> 3;
	var px2 = (entity_player.x + 6) >> 3;
	var pz1 = entity_player.z >> 3;
	var pz2 = (entity_player.z + 4) >> 3;
	for (var i = 0; i < rooms.length; i++) {
		var r = rooms[i];
		if (px1 >= r.x && px2 < r.x + r.w && pz1 >= r.y && pz2 < r.y + r.h) {
			if (i !== last_room_idx && count_enemies_in_room(i) > 0) {
				locked_room_idx = i;
				audio_play(audio_sfx_explode);
				camera_shake = 4;
				terminal_show_notice('PORTAS TRANCADAS\nELIMINE TODOS');
			}
			last_room_idx = i;
			return;
		}
	}
	last_room_idx = -1;
}

function check_collisions_grid() {
	for (var i = 0; i < grid.length; i++) grid[i] = null;

	for (var i = 0; i < entities.length; i++) {
		var e = entities[i];
		if (e._dead) continue;
		var cx = _math.floor(e.x / GRID_CELL);
		var cy = _math.floor(e.z / GRID_CELL);
		if (cx < 0) cx = 0; else if (cx >= GRID_W) cx = GRID_W - 1;
		if (cy < 0) cy = 0; else if (cy >= GRID_H) cy = GRID_H - 1;
		var key = cy * GRID_W + cx;
		var bucket = grid[key];
		if (!bucket) { bucket = []; grid[key] = bucket; }
		bucket.push(e);
		e._gid = i;
	}

	for (var i = 0; i < entities.length; i++) {
		var e1 = entities[i];
		if (e1._dead) continue;
		var cx = _math.floor(e1.x / GRID_CELL);
		var cy = _math.floor(e1.z / GRID_CELL);
		if (cx < 0) cx = 0; else if (cx >= GRID_W) cx = GRID_W - 1;
		if (cy < 0) cy = 0; else if (cy >= GRID_H) cy = GRID_H - 1;
		for (var dy = -1; dy <= 1; dy++) {
			for (var dx = -1; dx <= 1; dx++) {
				var ncx = cx + dx, ncy = cy + dy;
				if (ncx < 0 || ncx >= GRID_W || ncy < 0 || ncy >= GRID_H) continue;
				var bucket = grid[ncy * GRID_W + ncx];
				if (!bucket) continue;
				for (var k = 0; k < bucket.length; k++) {
					var e2 = bucket[k];
					if (e2._dead || e2._gid <= e1._gid) continue;
					if (!(
						e1.x >= e2.x + 9 || e1.x + 9 <= e2.x ||
						e1.z >= e2.z + 9 || e1.z + 9 <= e2.z
					)) {
						e1._check(e2);
						e2._check(e1);
					}
				}
			}
		}
	}
}

function pause_game() {
	if (game_state !== 'playing') return;
	game_state = 'paused';
	for (var k in keys) keys[k] = 0;
	_document.onkeydown = function(ev) {
		if (ev.keyCode === 27) unpause_game();
		ev.preventDefault();
	};
	_document.onkeyup = function(ev) { ev.preventDefault(); };
	_document.onmousedown = function() {};
	_document.onmouseup = function() {};
}

function unpause_game() {
	game_state = 'playing';
	bind_input();
}

function draw_pause() {
	hud_ctx.fillStyle = 'rgba(0,0,0,0.65)';
	hud_ctx.fillRect(0, 0, hud_canvas.width, hud_canvas.height);
	hud_ctx.textAlign = 'center';
	hud_ctx.fillStyle = '#0ff';
	hud_ctx.font = 'bold 18px monospace';
	hud_ctx.fillText('PAUSADO', 160, 80);
	hud_ctx.fillStyle = '#888';
	hud_ctx.font = '10px monospace';
	hud_ctx.fillText('ESC PARA CONTINUAR', 160, 110);
}

function bind_input() {
	_document.onkeydown = function(ev) {
		if (ev.keyCode === 27 && game_state === 'playing') {
			pause_game();
			ev.preventDefault();
			return;
		}
		if (ev.keyCode === 81 && game_state === 'playing') {
			if (player_potions > 0 && entity_player && entity_player.h < player_max_hp) {
				player_potions--;
				entity_player.h++;
				audio_play(audio_sfx_pickup);
			}
			ev.preventDefault();
			return;
		}
		_temp = ev.keyCode;
		_temp = key_convert[_temp] || _temp;
		if (keys[_temp] !== udef) {
			keys[_temp] = 1;
			ev.preventDefault();
		}
	};
	_document.onkeyup = function(ev) {
		_temp = ev.keyCode;
		_temp = key_convert[_temp] || _temp;
		if (keys[_temp] !== udef) {
			keys[_temp] = 0;
			ev.preventDefault();
		}
	};
	_document.onmousemove = function(ev) {
		var r = c.getBoundingClientRect();
		mouse_x = (ev.clientX - r.left) / r.width * c.width;
		mouse_y = (ev.clientY - r.top) / r.height * c.height;
	};
	_document.onmousedown = function(ev) { keys[key_shoot] = 1; ev.preventDefault(); };
	_document.onmouseup = function(ev) { keys[key_shoot] = 0; ev.preventDefault(); };
}

function game_tick() {
	var time_now = performance.now();
	time_elapsed = (time_now - time_last) / 1000;
	time_last = time_now;
	if (time_elapsed > 0.1) time_elapsed = 0.1;

	if (game_state === 'menu') { draw_menu(); requestAnimationFrame(game_tick); return; }
	if (game_state === 'credits') { draw_credits(); requestAnimationFrame(game_tick); return; }
	if (game_state === 'quit') { draw_quit(); requestAnimationFrame(game_tick); return; }
	if (game_state === 'shop') { draw_shop(); requestAnimationFrame(game_tick); return; }
	if (game_state === 'loading') { draw_loading(); requestAnimationFrame(game_tick); return; }
	if (game_state === 'paused') { draw_pause(); requestAnimationFrame(game_tick); return; }
	if (game_state !== 'playing') {
		requestAnimationFrame(game_tick);
		return;
	}

	renderer_prepare_frame();

	for (var i = 0; i < entities.length; i++) {
		if (!entities[i]._dead) entities[i]._update();
	}

	check_collisions_grid();

	for (var i = 0; i < entities.length; i++) {
		if (!entities[i]._dead) entities[i]._render();
	}

	camera_x = camera_x * 0.92 - entity_player.x * 0.08;
	camera_y = camera_y * 0.92 - entity_player.y * 0.08;
	camera_z = camera_z * 0.92 - entity_player.z * 0.08;

	camera_shake *= 0.9;
	camera_x += camera_shake * (_math.random() - 0.5);
	camera_z += camera_shake * (_math.random() - 0.5);

	for (var i = 0; i < entity_player.h; i++) {
		push_sprite(-camera_x - 50 + i * 4, 29 - camera_y, -camera_z - 30, 26);
	}

	renderer_end_frame();

	// flash vermelho quando toma dano
	if (damage_flash > 0) {
		damage_flash -= time_elapsed * 3;
		hud_ctx.fillStyle = 'rgba(255,0,0,' + _math.max(0, damage_flash * 0.3) + ')';
		hud_ctx.fillRect(0, 0, hud_canvas.width, hud_canvas.height);
	}

	if (game_state === 'playing') {
		draw_hud();
		check_room_lock();
		count_enemies();
	}

	entities = entities.filter(function(e) {
		return entities_to_kill.indexOf(e) === -1;
	});
	entities_to_kill = [];

	requestAnimationFrame(game_tick);
}

function draw_hud() {
	if (!hud_ctx || !entity_player) return;
	if (damage_flash <= 0) {
		hud_ctx.clearRect(0, 0, hud_canvas.width, hud_canvas.height);
	}
	hud_ctx.font = '10px monospace';

	hud_ctx.fillStyle = '#0ff';
	hud_ctx.textAlign = 'right';
	hud_ctx.fillText('SCORE: ' + entity_player.score, 310, 12);

	if (entity_player.combo > 1) {
		hud_ctx.fillStyle = '#ff0';
		hud_ctx.fillText('x' + entity_player.combo + ' COMBO', 310, 24);
	}

	hud_ctx.fillStyle = '#888';
	hud_ctx.textAlign = 'center';
	hud_ctx.fillText('ANDAR ' + current_level, 160, 12);

	if (rooms.length) {
		hud_ctx.fillStyle = locked_room_idx >= 0 ? '#f80' : '#666';
		hud_ctx.font = '8px monospace';
		var sala_label = (last_room_idx >= 0 ? (last_room_idx + 1) : '-') + '/' + rooms.length;
		hud_ctx.fillText('SALA ' + sala_label + (locked_room_idx >= 0 ? ' (TRANCADA)' : ''), 160, 22);
		hud_ctx.font = '10px monospace';
	}

	hud_ctx.textAlign = 'left';
	for (var i = 0; i < player_max_hp; i++) {
		hud_ctx.fillStyle = i < entity_player.h ? '#f00' : '#333';
		hud_ctx.fillText('\u2665', 10 + i * 10, 12);
	}

	// arma atual (nome + tipo na mesma linha)
	var wp = weapon_defs[current_weapon];
	hud_ctx.fillStyle = wp.color;
	hud_ctx.fillText('[' + wp.name + ']', 10, 24);
	hud_ctx.fillStyle = '#666';
	hud_ctx.font = '8px monospace';
	hud_ctx.fillText(wp.type === 'melee' ? '· MELEE' : '· RANGED', 10 + (wp.name.length + 2) * 6 + 2, 24);
	hud_ctx.font = '10px monospace';

	// pocao (consumivel) - movido pra y=36 pra nao sobrepor combo
	hud_ctx.textAlign = 'right';
	hud_ctx.fillStyle = player_potions > 0 ? '#0f0' : '#444';
	hud_ctx.fillText('[Q] POCAO ' + player_potions + '/1', 310, 36);

	hud_ctx.textAlign = 'left';
	hud_ctx.fillStyle = entity_player._dash_cooldown <= 0 ? '#0f0' : '#f80';
	var dash_txt = entity_player._dash_cooldown <= 0 ? 'PRONTO' : (_math.ceil(entity_player._dash_cooldown * 10) / 10).toFixed(1) + 's';
	hud_ctx.fillText('DASH: ' + dash_txt, 10, 170);

	hud_ctx.fillStyle = '#f44';
	hud_ctx.textAlign = 'right';
	hud_ctx.fillText('INIMIGOS: ' + enemies_alive, 310, 170);

	var muted = typeof audio_muted !== 'undefined' && audio_muted;
	hud_ctx.fillStyle = muted ? '#f44' : '#444';
	hud_ctx.font = '8px monospace';
	hud_ctx.textAlign = 'center';
	hud_ctx.fillText(muted ? '[M] MUDO' : '[M] AUDIO', 160, 170);

	draw_compass();
}

function draw_compass() {
	if (!entity_player) return;

	var nearest = null, nearest_d2 = 1e12, is_stair = false;
	for (var i = 0; i < entities.length; i++) {
		var e = entities[i];
		if (e._dead) continue;
		var enemy = e instanceof entity_seeker_t ||
			e instanceof entity_shooter_t ||
			e instanceof entity_bomber_t ||
			e instanceof entity_boss_t;
		var stair = e instanceof entity_staircase_t && e._active;
		if (!enemy && !stair) continue;
		var dx = e.x - entity_player.x;
		var dz = e.z - entity_player.z;
		var d2 = dx * dx + dz * dz;
		if (d2 < nearest_d2) {
			nearest_d2 = d2;
			nearest = e;
			is_stair = stair;
		}
	}
	if (!nearest || nearest_d2 < 400) return;

	var ang = _math.atan2(nearest.z - entity_player.z, nearest.x - entity_player.x);
	var cx = 160, cy = 36;

	hud_ctx.save();
	hud_ctx.translate(cx, cy);
	hud_ctx.rotate(ang);
	hud_ctx.fillStyle = is_stair ? '#0ff' : '#f55';
	hud_ctx.beginPath();
	hud_ctx.moveTo(7, 0);
	hud_ctx.lineTo(-4, -4);
	hud_ctx.lineTo(-4, 4);
	hud_ctx.closePath();
	hud_ctx.fill();
	hud_ctx.restore();
}
