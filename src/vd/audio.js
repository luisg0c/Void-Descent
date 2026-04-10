var audio_ctx,
	audio_master_gain,
	audio_muted = false,
	audio_sfx_shoot,
	audio_sfx_hit,
	audio_sfx_hurt,
	audio_sfx_beep,
	audio_sfx_pickup,
	audio_sfx_terminal,
	audio_sfx_explode,
	audio_sfx_dash;

var sound_terminal = {
	osc1_oct: 6, osc1_det: 0, osc1_detune: 0, osc1_xenv: 0, osc1_vol: 0, osc1_waveform: 0,
	osc2_oct: 10, osc2_det: 0, osc2_detune: 0, osc2_xenv: 0, osc2_vol: 168, osc2_waveform: 3,
	noise_fader: 0, env_attack: 351, env_sustain: 0, env_release: 444, env_master: 192,
	fx_filter: 2, fx_freq: 7355, fx_resonance: 130, fx_delay_time: 3, fx_delay_amt: 36,
	fx_pan_freq: 0, fx_pan_amt: 0, lfo_osc1_freq: 0, lfo_fx_freq: 0, lfo_freq: 0, lfo_amt: 0, lfo_waveform: 0
};

var sound_shoot = {
	osc1_oct: 7, osc1_det: 0, osc1_detune: 0, osc1_xenv: 0, osc1_vol: 192, osc1_waveform: 0,
	osc2_oct: 2, osc2_det: 0, osc2_detune: 0, osc2_xenv: 0, osc2_vol: 192, osc2_waveform: 0,
	noise_fader: 28, env_attack: 269, env_sustain: 0, env_release: 444, env_master: 255,
	fx_filter: 0, fx_freq: 272, fx_resonance: 25, fx_delay_time: 5, fx_delay_amt: 29,
	fx_pan_freq: 0, fx_pan_amt: 47, lfo_osc1_freq: 0, lfo_fx_freq: 0, lfo_freq: 0, lfo_amt: 0, lfo_waveform: 0
};

var sound_hit = {
	osc1_oct: 8, osc1_det: 0, osc1_detune: 0, osc1_xenv: 1, osc1_vol: 160, osc1_waveform: 3,
	osc2_oct: 8, osc2_det: 0, osc2_detune: 0, osc2_xenv: 1, osc2_vol: 99, osc2_waveform: 2,
	noise_fader: 60, env_attack: 50, env_sustain: 200, env_release: 6800, env_master: 125,
	fx_filter: 4, fx_freq: 11025, fx_resonance: 254, fx_delay_time: 0, fx_delay_amt: 13,
	fx_pan_freq: 5, fx_pan_amt: 0, lfo_osc1_freq: 0, lfo_fx_freq: 1, lfo_freq: 4, lfo_amt: 60, lfo_waveform: 0
};

var sound_beep = {
	osc1_oct: 10, osc1_det: 0, osc1_detune: 0, osc1_xenv: 0, osc1_vol: 192, osc1_waveform: 2,
	osc2_oct: 6, osc2_det: 0, osc2_detune: 9, osc2_xenv: 0, osc2_vol: 192, osc2_waveform: 1,
	noise_fader: 0, env_attack: 137, env_sustain: 2000, env_release: 4611, env_master: 140,
	fx_filter: 1, fx_freq: 982, fx_resonance: 89, fx_delay_time: 6, fx_delay_amt: 25,
	fx_pan_freq: 6, fx_pan_amt: 77, lfo_osc1_freq: 0, lfo_fx_freq: 1, lfo_freq: 3, lfo_amt: 69, lfo_waveform: 0
};

var sound_hurt = {
	osc1_oct: 7, osc1_det: 3, osc1_detune: 140, osc1_xenv: 1, osc1_vol: 232, osc1_waveform: 3,
	osc2_oct: 6, osc2_det: 0, osc2_detune: 9, osc2_xenv: 0, osc2_vol: 30, osc2_waveform: 1,
	noise_fader: 17, env_attack: 4611, env_sustain: 1403, env_release: 34215, env_master: 256,
	fx_filter: 4, fx_freq: 948, fx_resonance: 196, fx_delay_time: 0, fx_delay_amt: 0,
	fx_pan_freq: 0, fx_pan_amt: 1, lfo_osc1_freq: 0, lfo_fx_freq: 1, lfo_freq: 13, lfo_amt: 255, lfo_waveform: 2
};

var sound_pickup = {
	osc1_oct: 5, osc1_det: 0, osc1_detune: 0, osc1_xenv: 1, osc1_vol: 97, osc1_waveform: 0,
	osc2_oct: 8, osc2_det: 0, osc2_detune: 0, osc2_xenv: 1, osc2_vol: 204, osc2_waveform: 0,
	noise_fader: 0, env_attack: 4298, env_sustain: 927, env_release: 1403, env_master: 255,
	fx_filter: 2, fx_freq: 484, fx_resonance: 134, fx_delay_time: 3, fx_delay_amt: 35,
	fx_pan_freq: 4, fx_pan_amt: 72, lfo_osc1_freq: 0, lfo_fx_freq: 1, lfo_freq: 6, lfo_amt: 231, lfo_waveform: 0
};

var sound_explode = {
	osc1_oct: 8, osc1_det: 0, osc1_detune: 0, osc1_xenv: 1, osc1_vol: 147, osc1_waveform: 1,
	osc2_oct: 6, osc2_det: 0, osc2_detune: 0, osc2_xenv: 1, osc2_vol: 159, osc2_waveform: 1,
	noise_fader: 255, env_attack: 197, env_sustain: 1234, env_release: 21759, env_master: 232,
	fx_filter: 2, fx_freq: 1052, fx_resonance: 255, fx_delay_time: 4, fx_delay_amt: 73,
	fx_pan_freq: 3, fx_pan_amt: 25, lfo_osc1_freq: 0, lfo_fx_freq: 0, lfo_freq: 0, lfo_amt: 0, lfo_waveform: 0
};

var sound_dash = {
	osc1_oct: 7, osc1_det: 0, osc1_detune: 0, osc1_xenv: 1, osc1_vol: 100, osc1_waveform: 0,
	osc2_oct: 3, osc2_det: 0, osc2_detune: 0, osc2_xenv: 1, osc2_vol: 50, osc2_waveform: 0,
	noise_fader: 180, env_attack: 100, env_sustain: 200, env_release: 3000, env_master: 180,
	fx_filter: 3, fx_freq: 6000, fx_resonance: 200, fx_delay_time: 0, fx_delay_amt: 0,
	fx_pan_freq: 0, fx_pan_amt: 0, lfo_osc1_freq: 0, lfo_fx_freq: 0, lfo_freq: 0, lfo_amt: 0, lfo_waveform: 0
};

// ambient leve — 2 patterns x 32 rows x rowLen 11025 = 16s loop
var music_void_descent = {
	rowLen: 11025,
	endPattern: 3,
	songLen: 16,
	songData: [
		// drone — saw + sub sin, alterna E/C
		{
			osc1_oct: 6, osc1_det: 0, osc1_detune: 0, osc1_xenv: 0, osc1_vol: 180, osc1_waveform: 2,
			osc2_oct: 5, osc2_det: 0, osc2_detune: 12, osc2_xenv: 0, osc2_vol: 150, osc2_waveform: 0,
			noise_fader: 4, env_attack: 22000, env_sustain: 60000, env_release: 120000, env_master: 160,
			fx_filter: 2, fx_freq: 400, fx_resonance: 220,
			fx_delay_time: 5, fx_delay_amt: 80,
			fx_pan_freq: 1, fx_pan_amt: 70,
			lfo_osc1_freq: 0, lfo_fx_freq: 1, lfo_freq: 4, lfo_amt: 180, lfo_waveform: 0,
			p: [1,2],
			c: [
				{n: [116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}, // E
				{n: [112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}  // C
			]
		}
	]
};

function audio_init(callback) {
	audio_ctx = new (window.AudioContext || window.webkitAudioContext)();
	audio_master_gain = audio_ctx.createGain();
	audio_master_gain.gain.value = 1;
	audio_master_gain.connect(audio_ctx.destination);
	sonantxr_generate_song(audio_ctx, music_void_descent, function(buffer) {
		audio_play(buffer, true);
		callback();
	});
	sonantxr_generate_sound(audio_ctx, sound_shoot, 140, function(b) { audio_sfx_shoot = b; });
	sonantxr_generate_sound(audio_ctx, sound_hit, 134, function(b) { audio_sfx_hit = b; });
	sonantxr_generate_sound(audio_ctx, sound_beep, 173, function(b) { audio_sfx_beep = b; });
	sonantxr_generate_sound(audio_ctx, sound_hurt, 144, function(b) { audio_sfx_hurt = b; });
	sonantxr_generate_sound(audio_ctx, sound_pickup, 156, function(b) { audio_sfx_pickup = b; });
	sonantxr_generate_sound(audio_ctx, sound_terminal, 156, function(b) { audio_sfx_terminal = b; });
	sonantxr_generate_sound(audio_ctx, sound_explode, 114, function(b) { audio_sfx_explode = b; });
	sonantxr_generate_sound(audio_ctx, sound_dash, 130, function(b) { audio_sfx_dash = b; });
}

function audio_play(buffer, loop) {
	if (!buffer) return;
	var source = audio_ctx.createBufferSource();
	source.buffer = buffer;
	source.loop = !!loop;
	source.connect(audio_master_gain || audio_ctx.destination);
	source.start();
}

function audio_toggle_mute() {
	audio_muted = !audio_muted;
	if (audio_master_gain) audio_master_gain.gain.value = audio_muted ? 0 : 1;
}
