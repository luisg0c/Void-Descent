var
	level_width = 64,
	level_height = 64,
	level_data = new Uint8Array(level_width * level_height),
	rooms = [];

var TILE_VOID = 0,
	TILE_FLOOR_MIN = 1,
	TILE_FLOOR_MAX = 7,
	TILE_WALL_MIN = 8,
	TILE_WALL_MAX = 17;

function dungeon_generate(floor_id) {
	level_data.fill(0);
	rooms = [];
	num_verts = 0;
	num_lights = 0;

	var num_rooms = floor_id === 3 ? 5 : 4 + floor_id,
		min_room = 7,
		max_room = 11,
		attempts = 0,
		max_attempts = 500;

	while (rooms.length < num_rooms && attempts < max_attempts) {
		attempts++;
		var w = random_int(min_room, max_room),
			h = random_int(min_room, max_room),
			x = random_int(2, level_width - w - 2),
			y = random_int(2, level_height - h - 2);

		var overlaps = false;
		for (var i = 0; i < rooms.length; i++) {
			var r = rooms[i];
			if (x - 1 < r.x + r.w && x + w + 1 > r.x &&
				y - 1 < r.y + r.h && y + h + 1 > r.y) {
				overlaps = true;
				break;
			}
		}

		if (!overlaps) {
			rooms.push({
				x: x, y: y, w: w, h: h,
				cx: (x + w / 2) | 0,
				cy: (y + h / 2) | 0,
				type: 'normal'
			});
		}
	}

	rooms[0].type = 'start';
	if (floor_id === 3) {
		rooms[rooms.length - 1].type = 'boss';
		if (rooms.length > 2) rooms[1].type = 'chest';
	} else {
		rooms[rooms.length - 1].type = 'chest';
	}

	for (var i = 0; i < rooms.length - 1; i++) {
		dungeon_corridor(rooms[i].cx, rooms[i].cy, rooms[i + 1].cx, rooms[i + 1].cy);
	}

	for (var i = 0; i < rooms.length; i++) {
		var r = rooms[i];
		for (var ry = r.y; ry < r.y + r.h; ry++) {
			for (var rx = r.x; rx < r.x + r.w; rx++) {
				level_data[rx + ry * level_width] = array_rand([1, 1, 1, 1, 1, 3, 3, 2, 5, 5, 5, 5, 5, 5, 7, 7, 6]);
			}
		}
	}

	// paredes ao redor do chao
	for (var y = 1; y < level_height - 1; y++) {
		for (var x = 1; x < level_width - 1; x++) {
			if (level_data[x + y * level_width] !== TILE_VOID) continue;
			var adj = false;
			for (var dy = -1; dy <= 1; dy++) {
				for (var dx = -1; dx <= 1; dx++) {
					var t = level_data[(x + dx) + (y + dy) * level_width];
					if (t >= TILE_FLOOR_MIN && t <= TILE_FLOOR_MAX) adj = true;
				}
			}
			if (adj) {
				level_data[x + y * level_width] = random_int(0, 5) < 4 ? 8 : random_int(8, 17);
			}
		}
	}

	// geometria
	for (var y = 0; y < level_height; y++) {
		for (var x = 0; x < level_width; x++) {
			var tile = level_data[x + y * level_width];
			if (tile > 7) {
				push_block(x * 8, y * 8, 4, tile - 1);
			} else if (tile > 0) {
				push_floor(x * 8, y * 8, tile - 1);
			}
		}
	}

	level_num_verts = num_verts;
	return rooms;
}

function dungeon_corridor(x1, y1, x2, y2) {
	var cx = x1, cy = y1;

	if (random_int(0, 1) === 0) {
		while (cx !== x2) { dungeon_carve(cx, cy); cx += cx < x2 ? 1 : -1; }
		while (cy !== y2) { dungeon_carve(cx, cy); cy += cy < y2 ? 1 : -1; }
	} else {
		while (cy !== y2) { dungeon_carve(cx, cy); cy += cy < y2 ? 1 : -1; }
		while (cx !== x2) { dungeon_carve(cx, cy); cx += cx < x2 ? 1 : -1; }
	}
	dungeon_carve(cx, cy);
}

function dungeon_carve(x, y) {
	for (var dy = 0; dy <= 1; dy++) {
		for (var dx = 0; dx <= 1; dx++) {
			var idx = (x + dx) + (y + dy) * level_width;
			if (idx >= 0 && idx < level_width * level_height && level_data[idx] === TILE_VOID) {
				level_data[idx] = array_rand([1, 1, 5, 5, 5, 7]);
			}
		}
	}
}
