var terminal_text_ident = '> ';
var terminal_text_title = '' +
	'VOID DESCENT\n' +
	'__ \n' +
	'UM JOGO POR:\n' +
	'LUIS GUSTAVO OLIMPIO\n' +
	'LAUAN MATHEUS\n' +
	'JOSE MELQUIADES\n' +
	'JOAO LEONARDI\n' +
	'___ \n' +
	'SYSTEM VERSION: 3.14.25\n' +
	'CPU: VOID-CORE Q7 @ 8.2 THZ\n' +
	'MEMORY: 108086391056891900 BYTES\n' +
	' \n' +
	'CONECTANDO...';

var terminal_text_garbage =
	'A1eI9NQ94CiyiRkET-fA0ecA' +
	'1fX8Rjf0cAmoDn=s7';

var terminal_text_story =
	'DATA: MAR. 25, 2718 - 13:32\n' +
	'FALHA CRITICA DE SOFTWARE DETECTADA\n' +
	'ANALISANDO...\n' +
	'____\n \n' +
	'CODIGO DE ERRO: VOID-DESC-001\n' +
	'STATUS: SISTEMAS OFFLINE\n' +
	'DESCRICAO: BUFFER UNDERFLOW NO NUCLEO CENTRAL\n' +
	'SISTEMA AFETADO: AUTOMACAO DA INSTALACAO\n' +
	'SUBSISTEMAS: IA, ESCUDOS DE RADIACAO, ENERGIA\n' +
	' \n' +
	'INICIANDO SISTEMA DE RESGATE...\n' +
	'___' +
	'FALHOU\n \n' +
	'TENTANDO REBOOT AUTOMATIZADO...\n' +
	'___' +
	'FALHOU\n' +
	'_ \n \n' +
	'REBOOT MANUAL NECESSARIO\n' +
	'_ \n' +
	'USE WASD PARA MOVER, MOUSE PARA MIRAR E ATIRAR\n' +
	'ESPACO PARA DASH\n' +
	'CLIQUE PARA INICIAR\n ';

var terminal_text_outro =
	'BOSS DESTRUIDO\n' +
	'TODOS OS SISTEMAS ONLINE\n' +
	'___' +
	'CONEXAO RESTABELECIDA\n' +
	'RECEBENDO TRANSMISSAO...___ \n' +
	'OBRIGADO POR JOGAR\n \n' +
	'VOID DESCENT\n' +
	'__ \n' +
	'FIM DA TRANSMISSAO';

var terminal_text_buffer = [],
	terminal_state = 0,
	terminal_current_line,
	terminal_line_wait = 100,
	terminal_print_ident = true,
	terminal_timeout_id = 0,
	terminal_hide_timeout = 0;

terminal_text_garbage += terminal_text_garbage + terminal_text_garbage + terminal_text_garbage;

function terminal_show() {
	clearTimeout(terminal_hide_timeout);
	a.style.opacity = 1;
	a.style.display = 'block';
}

function terminal_hide() {
	a.style.opacity = 0;
	terminal_hide_timeout = setTimeout(function() { a.style.display = 'none'; }, 1000);
}

function terminal_cancel() {
	clearTimeout(terminal_timeout_id);
}

function terminal_prepare_text(text) {
	return text.replace(/_/g, '\n'.repeat(10)).split('\n');
}

function terminal_write_text(lines, callback) {
	if (lines.length) {
		terminal_write_line(lines.shift(), terminal_write_text.bind(this, lines, callback));
	} else {
		callback && callback();
	}
}

function terminal_write_line(line, callback) {
	if (terminal_text_buffer.length > 20) terminal_text_buffer.shift();
	if (line) {
		audio_play(audio_sfx_terminal);
		terminal_text_buffer.push((terminal_print_ident ? terminal_text_ident : '') + line);
		while (a.firstChild) a.removeChild(a.firstChild);
		for (var i = 0; i < terminal_text_buffer.length; i++) {
			var div = document.createElement('div');
			div.textContent = terminal_text_buffer[i];
			a.appendChild(div);
		}
		var cursor = document.createElement('b');
		cursor.textContent = '\u2588';
		a.lastChild.appendChild(cursor);
	}
	terminal_timeout_id = setTimeout(callback, terminal_line_wait);
}

function terminal_show_notice(notice, callback) {
	while (a.firstChild) a.removeChild(a.firstChild);
	terminal_text_buffer = [];
	terminal_cancel();
	terminal_show();
	terminal_write_text(terminal_prepare_text(notice), function() {
		terminal_timeout_id = setTimeout(function() {
			terminal_hide();
			callback && callback();
		}, 2000);
	});
}

function terminal_run_intro(callback) {
	terminal_text_buffer = [];
	terminal_write_text(terminal_prepare_text(terminal_text_title), function() {
		terminal_timeout_id = setTimeout(function() {
			terminal_run_garbage(callback);
		}, 4000);
	});
}

function terminal_run_garbage(callback) {
	terminal_print_ident = false;
	terminal_line_wait = 16;

	var t = terminal_text_garbage,
		length = terminal_text_garbage.length;

	for (var i = 0; i < 64; i++) {
		var s = (_math.random() * length) | 0;
		var e = (_math.random() * (length - s)) | 0;
		t += terminal_text_garbage.substring(s, s + e) + '\n';
	}
	t += ' \n \n';
	terminal_write_text(terminal_prepare_text(t), function() {
		terminal_timeout_id = setTimeout(function() {
			terminal_run_story(callback);
		}, 1500);
	});
}

function terminal_run_story(callback) {
	terminal_print_ident = true;
	terminal_line_wait = 100;
	terminal_write_text(terminal_prepare_text(terminal_text_story), callback);
}

function terminal_run_outro() {
	c.style.opacity = 0.3;
	while (a.firstChild) a.removeChild(a.firstChild);
	terminal_text_buffer = [];
	terminal_cancel();
	terminal_show();
	terminal_write_text(terminal_prepare_text(terminal_text_outro));
}
