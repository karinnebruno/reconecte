-- ============================================================
-- IMPORTAÇÃO SEGURA DE PACIENTES — Reconecte
-- Idempotente: pode rodar mais de uma vez sem duplicar
-- Passo 1: Remove duplicatas (mantém o registro mais antigo)
-- Passo 2: Insere apenas os que não existem ainda
-- ============================================================

-- PASSO 1: Remove duplicatas (se o import foi rodado mais de uma vez)
DELETE FROM patients
WHERE id NOT IN (
  SELECT DISTINCT ON (LOWER(TRIM(nome))) id
  FROM patients
  ORDER BY LOWER(TRIM(nome)), created_at ASC
);

-- Confirma quantos sobraram
-- SELECT COUNT(*), status FROM patients GROUP BY status;

-- PASSO 2: Insere pacientes ativos que não existem ainda
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Adelmo Dyones Lisboa Batista', '(83) 9826-3670', NULL, NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Adelmo Dyones Lisboa Batista')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Alba Valéria Santos de Oliveira', '(87) 98111-6699', 'amabiel@gmail.com', '033.972.024-77', NULL, 'ativo', 'Precisa de Recibo' WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Alba Valéria Santos de Oliveira')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Beatriz de Sousa Alves', '(88) 99223-4985', 'Sousabeatriz404@gmail.com', NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Beatriz de Sousa Alves')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Carlos Rocha', '5519997738592', 'carlo.rocha@gmail.com', NULL, NULL, 'ativo', 'Meta' WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Carlos Rocha')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Cintia Grigoletto', '(11) 97751-5000', 'cingrigo@gmail.com', '376.789.378-90', '1989-09-22', 'ativo', 'Precisa de Recibo - Nome do outro' WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Cintia Grigoletto')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Deusimar Navarro de Abreu', '(94) 9292-3223', NULL, NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Deusimar Navarro de Abreu')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Estefania do Nascimento', '(88) 99655-2453', 'estefaniaribeiro22@gmail.com', NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Estefania do Nascimento')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Fabiana Alves da Silva', '(98) 8465-6339', NULL, NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Fabiana Alves da Silva')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Felipe Moreira Abrão', '(63) 9976-8107', 'felipeabrao_1@hotmail.com', '021.473.301-75', NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Felipe Moreira Abrão')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Flávio Augusto Lima Benedito', '(13) 98156-2421', NULL, '339.595.648-21', NULL, 'ativo', 'Precisa de Recibo' WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Flávio Augusto Lima Benedito')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Gabriela Simões Nunes', '(21) 99467-6034', 'contatodocedegabi@gmail.com', '181.606.187-51', NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Gabriela Simões Nunes')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Guilherme dos Santos Gonçalves Dias', '(21) 96418-3159', NULL, NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Guilherme dos Santos Gonçalves Dias')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Jefferson de Souza Pinto', '5561991430600', 'jeffersonsouzzaa@hotmail.com', '037.098.931-78', NULL, 'ativo', 'Meta - 22 | Precisa de Recibo' WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Jefferson de Souza Pinto')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Kadmo Thalis Gomes lira', '(88) 99207-0612', NULL, NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Kadmo Thalis Gomes lira')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Kamila de Lima Santos', '(92) 9999-6987', 'kamilaeevans@gmail.com', '037.522.532-31', '1996-03-03', 'ativo', 'Precisa de Recibo' WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Kamila de Lima Santos')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Lorhana Lisboa Ribeiro', '(83) 99951-4328', 'lorhanalisboa@gmail.com', '033.778.423-06', '1995-06-18', 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Lorhana Lisboa Ribeiro')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Luana Stefany Alves Ferreira', '(16) 99775-8241', 'Lu.valen0914@gmail.com', '022.523.126-37', NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Luana Stefany Alves Ferreira')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Lucas HERO', '608981074', 'lucas.hero.pro@gmail.com', '122.906.201-73', NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Lucas HERO')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Lucas Sousa', '(85) 8216-6125', 'lucasousaddd95@gmail.com', '045.619.723-07', NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Lucas Sousa')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Maria Alline Euzebio', '(51) 29918-1112', NULL, NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Maria Alline Euzebio')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Michael Schneider', '(15) 56232-5600', NULL, NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Michael Schneider')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Michaelle Ferreira Souto de Oliveira', '(77) 9884-5410', 'michaellefsouto@gmail.com', '051.719.685-94', '2026-02-09', 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Michaelle Ferreira Souto de Oliveira')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Nara Raianne Oliveira Pires', '(63) 9253-7489', NULL, '041.297.121-60', NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Nara Raianne Oliveira Pires')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Nathália Furtado Gomes', '(24) 99225-8402', 'nathaliafurtadogomes2004@gmail.com', NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Nathália Furtado Gomes')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Rayssa Felix Scarlecio', '(21) 99090-1852', NULL, '134.132.227-08', NULL, 'ativo', 'Precisa de Recibo' WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Rayssa Felix Scarlecio')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Rodrigo', '(11) 97135-6465', 'rodrigo@colegiomiranda.com.br', NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Rodrigo')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Ronaldo Francelino da Silva', '(11) 98686-9551', 'ronaldofrancelino.adv@gmail.com', NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Ronaldo Francelino da Silva')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Tallytta Sarah V Silva', '5563984026099', NULL, NULL, NULL, 'ativo', 'Google - 2' WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Tallytta Sarah V Silva')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Tatiane de Jesus souza', '(93) 9128-7024', NULL, '836.543.132-72', NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Tatiane de Jesus souza')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Thaynis da Silva Araújo', '(62) 9916-1802', 'mssantos1989@hotmail.com.br', NULL, NULL, 'ativo', NULL WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Thaynis da Silva Araújo')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Thiago Grigoletto', '(11) 97055-2051', 'thiagogrigo@gmail.com', '335.672.188-75', '1986-10-15', 'ativo', 'Google - 2 | Precisa de Recibo' WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Thiago Grigoletto')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Wagner de Carvalho Ferreira', '5511991663400', 'wcarvalho.ferreira@gmail.com', '295.487.338-89', NULL, 'ativo', 'Google | Precisa de Recibo' WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Wagner de Carvalho Ferreira')));
INSERT INTO patients (nome, whatsapp, email, cpf, data_nascimento, status, notas_admin) SELECT 'Walisson Miguel Severnini', '(46) 9910-3480', 'Laisamaiara@hotmail.com', NULL, NULL, 'ativo', 'Precisa de Recibo' WHERE NOT EXISTS (SELECT 1 FROM patients WHERE LOWER(TRIM(nome)) = LOWER(TRIM('Walisson Miguel Severnini')));

-- VÍNCULOS DE CASAL
UPDATE patients SET parceiro_id = (SELECT id FROM patients WHERE nome = 'Thiago Grigoletto' LIMIT 1) WHERE nome = 'Cintia Grigoletto' AND parceiro_id IS NULL;
UPDATE patients SET parceiro_id = (SELECT id FROM patients WHERE nome = 'Cintia Grigoletto' LIMIT 1) WHERE nome = 'Thiago Grigoletto' AND parceiro_id IS NULL;
