// Mensagens locais fixas: nunca imprimir error.message, que pode conter dados privados.
export function bootstrapFeedback(error) {
  if (error?.code === 'PASSWORD_CONFIRMATION') return 'As senhas não coincidem. Digite a mesma senha nas duas perguntas.';
  if (error?.code === 'VALIDATION_ERROR') {
    const messages = {
      name: 'O nome deve ter entre 3 e 100 caracteres.',
      email: 'Informe um e-mail válido com no máximo 254 caracteres.',
      password: 'A senha deve ter entre 12 e 128 caracteres.'
    };
    const fields = [...new Set((error.fields || []).map(item => item.field))];
    return fields.map(field => messages[field]).filter(Boolean).join(' ') || 'Revise nome, e-mail e senha.';
  }
  if (error?.code === 'ADMIN_EXISTS') return 'Já existe um administrador. Use o login ou a recuperação de senha; nenhum novo administrador foi criado.';
  if (error?.code === 'P2002') return 'Este e-mail já está cadastrado. Nenhuma conta foi alterada.';
  if (error?.code === 'P2021' || error?.code === 'P2022') return 'A estrutura do banco está incompleta. Execute npm.cmd run db:migrate e tente novamente.';
  if (error?.code === 'P1000' || error?.code === 'P1001' || error?.code === 'ECONNREFUSED') return 'Não foi possível conectar ao banco. Confira o PostgreSQL e a configuração local do .env.';
  return 'Não foi possível concluir. Confira o .env, o PostgreSQL, as migrations e as dependências. Execute npm.cmd test para diagnosticar, sem compartilhar segredos.';
}
