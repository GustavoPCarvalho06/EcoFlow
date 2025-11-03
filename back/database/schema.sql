
DROP DATABASE EcoFlowBD;
CREATE DATABASE EcoFlowBD;
USE EcoFlowBD;

#--- Administrador -----------------------------------------------------------------------------------------------------------------
CREATE TABLE usuarios (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),	
	cpf VARCHAR(14) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    email varchar (255) unique,
    cargo ENUM ("administrador","coordenador","coletor") default "coletor",
    statusConta ENUM ("ativo","desligado") default "ativo"
);
#--- Sensor IOT -----------------------------------------------------------------------------------------------------------------
CREATE TABLE SistemaSensor(
	id_Sensor INT AUTO_INCREMENT PRIMARY KEY,
    statusLixo ENUM ('Cheia','Quase Cheia','Vazia') DEFAULT 'Vazia', # ver dps se deixa "Quase Cheia" ou "Metade" checar na documentaçao
    localizacao POINT
);

#--- Mensagens Suporte -----------------------------------------------------------------------------------------------------------------
CREATE TABLE mensagens_suporte (
id_mensagem_suporte INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR (100) NOT NULL,
mensagem TEXT NOT NULL, 
status_mensagem BOOLEAN NOT NULL
);



#--- Mensagem e cumunicação entre os usuarios ---------------------------------------------------------------------------------------------
CREATE TABLE mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conteudo TEXT NOT NULL,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_leitura BOOLEAN DEFAULT 0, -- 0 para não lida, 1 para lida
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);




CREATE TABLE historico_sensores (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_sensor INT,
    statusLixo ENUM('Cheia','Quase Cheia','Vazia') NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sensor) REFERENCES SistemaSensor(id_Sensor)
);


-- =============================================================================================
-- [NOVO] Tabela para o Mural de Comunicados
-- =============================================================================================
CREATE TABLE comunicados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    autor_id INT NOT NULL,
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- [NOVO] Coluna para armazenar a data da última edição.
    -- É NULL por padrão, pois um comunicado não é editado ao ser criado.
    data_edicao TIMESTAMP NULL DEFAULT NULL,

    FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE comunicados_vistos (
    usuario_id INT NOT NULL,
    comunicado_id INT NOT NULL,
    data_visualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, comunicado_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (comunicado_id) REFERENCES comunicados(id) ON DELETE CASCADE
);



#--- VIEWS -----------------------------------------------------------------------------------------------------------------
# Relatorio das Rotas
CREATE VIEW RotasRelatorio AS
SELECT SistemaSensor.id_Sensor AS ID, SistemaSensor.statusLixo AS Stats, SistemaSensor.localizacao AS Coordenadas
FROM SistemaSensor;

# Relatório de Usuários Ativos
CREATE VIEW UsuariosTrampo AS
SELECT usuarios.id AS ID, usuarios.nome AS Nome, usuarios.cargo AS Cargo, usuarios.statusConta AS Status
FROM usuarios;

# Relatório de Mensagens Pendentes de Suporte

CREATE VIEW MensagensPendentes AS
SELECT mensagens_suporte.id_mensagem_suporte AS ID, mensagens_suporte.nome AS Remetente, mensagens_suporte.mensagem AS Mensagem, mensagens_suporte.status_mensagem AS Resolvida
FROM mensagens_suporte
WHERE mensagens_suporte.status_mensagem = 0;

CREATE VIEW StatusPorDia AS
SELECT 
    DATE(data_registro) AS Dia,
    statusLixo AS Status,
    COUNT(*) AS Quantidade
FROM historico_sensores
GROUP BY DATE(data_registro), statusLixo;



#--- TRIGGERS -----------------------------------------------------------------------------------------------------------------

DELIMITER $$

CREATE TRIGGER trg_status_sensor
AFTER UPDATE ON SistemaSensor
FOR EACH ROW
BEGIN
    IF NEW.statusLixo <> OLD.statusLixo THEN
        INSERT INTO historico_sensores (id_sensor, statusLixo)
        VALUES (NEW.id_Sensor, NEW.statusLixo);
    END IF;
END$$

DELIMITER ;


#SELECT * FROM usuarios;
#SELECT * FROM RotasRelatorio;


#--- INSERTS PARA TEST -----------------------------------------------------------------------------------------------------------------
INSERT INTO SistemaSensor (statusLixo, localizacao) VALUES
('Vazia', ST_GeomFromText('POINT(-46.557282 -23.647222)')),
('Quase Cheia', ST_GeomFromText('POINT(-46.555083 -23.645723)')),
('Cheia', ST_GeomFromText('POINT(-46.552413 -23.644962)')),
('Vazia', ST_GeomFromText('POINT(-46.556209 -23.640472)')),
('Quase Cheia', ST_GeomFromText('POINT(-46.560171 -23.643114)')),
('Cheia', ST_GeomFromText('POINT(-46.560212 -23.646610)'));


# Usuários
#INSERT INTO usuarios (nome, cpf, senha, cargo, statusConta) VALUES
#('miguel', '00000000000', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', 'administrador', 'ativo'),
#('Maria Santos', '98765432100', 'senha456', 'coordenador', 'ativo'),
#('Carlos Nunes', '55566677788', 'senha789', 'coletor', 'ativo'),
#('Ana Silva', '22233344455', '1234abcd', 'coletor', 'desligado');





INSERT INTO usuarios (nome, email, cpf, senha, cargo, statusConta) VALUES
('miguel', 'miguel@example.com', '00000000000', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', 'administrador', 'ativo'),
('lalau', 'lalau@example.com', '10000000001', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', 'coordenador', 'ativo'),
('gustavo', 'gustavo@example.com', '10000000002', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', 'coordenador', 'ativo'),
('Carla Dias', 'carla.dias@example.com', '10000000003', 'senha123', 'coletor', 'desligado'),
('Daniel Farias', 'daniel.farias@example.com', '10000000004', 'senha123', 'coletor', 'ativo'),
('Elisa Gomes', 'elisa.gomes@example.com', '10000000005', 'senha123', 'coordenador', 'ativo'),
('Fábio Rocha', 'fabio.rocha@example.com', '10000000006', 'senha123', 'coletor', 'ativo'),
('Gabriela Lima', 'gabriela.lima@example.com', '10000000007', 'senha123', 'coletor', 'desligado'),
('Henrique Martins', 'henrique.martins@example.com', '10000000008', 'senha123', 'coordenador', 'ativo'),
('Isabela Nogueira', 'isabela.nogueira@example.com', '10000000009', 'senha123', 'coletor', 'ativo'),
('João Pereira', 'joao.pereira@example.com', '10000000010', 'senha123', 'coletor', 'ativo'),
('Larissa Barbosa', 'larissa.barbosa@example.com', '10000000011', 'senha123', 'coordenador', 'desligado'),
('Marcos Ribeiro', 'marcos.ribeiro@example.com', '10000000012', 'senha123', 'coletor', 'ativo'),
('Natália Sousa', 'natalia.sousa@example.com', '10000000013', 'senha123', 'coletor', 'ativo'),
('Otávio Azevedo', 'otavio.azevedo@example.com', '10000000014', 'senha123', 'coordenador', 'ativo'),
('Patrícia Ferreira', 'patricia.ferreira@example.com', '10000000015', 'senha123', 'coletor', 'desligado'),
('Quintino Barros', 'quintino.barros@example.com', '10000000016', 'senha123', 'coletor', 'ativo'),
('Renata Cardoso', 'renata.cardoso@example.com', '10000000017', 'senha123', 'coordenador', 'ativo'),
('Sérgio Tavares', 'sergio.tavares@example.com', '10000000018', 'senha123', 'coletor', 'ativo'),
('Tatiane Vasconcelos', 'tatiane.vasconcelos@example.com', '10000000019', 'senha123', 'coletor', 'ativo'),
('Ulisses Brandão', 'ulisses.brandao@example.com', '10000000020', 'senha123', 'coordenador', 'desligado'),
('Vanessa Moraes', 'vanessa.moraes@example.com', '10000000021', 'senha123', 'coletor', 'ativo'),
('Wagner Pinto', 'wagner.pinto@example.com', '10000000022', 'senha123', 'coletor', 'ativo'),
('Ximena Freitas', 'ximena.freitas@example.com', '10000000023', 'senha123', 'coordenador', 'ativo'),
('Yasmin Correia', 'yasmin.correia@example.com', '10000000024', 'senha123', 'coletor', 'ativo'),
('Zeca Drummond', 'zeca.drummond@example.com', '10000000025', 'senha123', 'coletor', 'desligado'),
('Alice Salgado', 'alice.salgado@example.com', '10000000026', 'senha123', 'coordenador', 'ativo'),
('Bernardo Campos', 'bernardo.campos@example.com', '10000000027', 'senha123', 'coletor', 'ativo'),
('Clara Siqueira', 'clara.siqueira@example.com', '10000000028', 'senha123', 'coletor', 'ativo'),
('Davi Queiroz', 'davi.queiroz@example.com', '10000000029', 'senha123', 'coordenador', 'desligado'),
('Esther Neves', 'esther.neves@example.com', '10000000030', 'senha123', 'coletor', 'ativo'),
('Felipe Viana', 'felipe.viana@example.com', '10000000031', 'senha123', 'coletor', 'ativo'),
('Giovanna Justo', 'giovanna.justo@example.com', '10000000032', 'senha123', 'coordenador', 'ativo'),
('Heitor Xavier', 'heitor.xavier@example.com', '10000000033', 'senha123', 'coletor', 'desligado'),
('Íris Zanetti', 'iris.zanetti@example.com', '10000000034', 'senha123', 'coletor', 'ativo'),
('Júlio Pires', 'julio.pires@example.com', '10000000035', 'senha123', 'coordenador', 'ativo'),
('Lorena Ramos', 'lorena.ramos@example.com', '10000000036', 'senha123', 'coletor', 'ativo'),
('Murilo Castilho', 'murilo.castilho@example.com', '10000000037', 'senha123', 'coletor', 'ativo'),
('Nicole Dantas', 'nicole.dantas@example.com', '10000000038', 'senha123', 'coordenador', 'desligado'),
('Otávio Guerra', 'otavio.guerra@example.com', '10000000039', 'senha123', 'coletor', 'ativo'),
('Pietra Juncos', 'pietra.juncos@example.com', '10000000040', 'senha123', 'coletor', 'ativo'),
('Rafael Lemos', 'rafael.lemos@example.com', '10000000041', 'senha123', 'coordenador', 'ativo'),
('Sofia Arantes', 'sofia.arantes@example.com', '10000000042', 'senha123', 'coletor', 'desligado'),
('Théo Borges', 'theo.borges@example.com', '10000000043', 'senha123', 'coletor', 'ativo'),
('Valentina Chaves', 'valentina.chaves@example.com', '10000000044', 'senha123', 'coordenador', 'ativo'),
('Arthur da Mata', 'arthur.da.mata@example.com', '10000000045', 'senha123', 'coletor', 'ativo'),
('Beatriz Esteves', 'beatriz.esteves@example.com', '10000000046', 'senha123', 'coletor', 'ativo'),
('Caio Fortes', 'caio.fortes@example.com', '10000000047', 'senha123', 'coordenador', 'desligado'),
('Helena Guedes', 'helena.guedes@example.com', '10000000048', 'senha123', 'coletor', 'ativo'),
('Isadora Ibarra', 'isadora.ibarra@example.com', '10000000049', 'senha123', 'coletor', 'ativo'),
('Leonardo Jardim', 'leonardo.jardim@example.com', '10000000050', 'senha123', 'coordenador', 'ativo'),
('Manuela Lobato', 'manuela.lobato@example.com', '10000000051', 'senha123', 'coletor', 'desligado'),
('Noah Menezes', 'noah.menezes@example.com', '10000000052', 'senha123', 'coletor', 'ativo'),
('Olívia Novais', 'olivia.novais@example.com', '10000000053', 'senha123', 'coordenador', 'ativo'),
('Pedro Otero', 'pedro.otero@example.com', '10000000054', 'senha123', 'coletor', 'ativo'),
('Rafaela Padilha', 'rafaela.padilha@example.com', '10000000055', 'senha123', 'coletor', 'ativo'),
('Samuel Quintanilha', 'samuel.quintanilha@example.com', '10000000056', 'senha123', 'coordenador', 'desligado'),
('Vitória Rangel', 'vitoria.rangel@example.com', '10000000057', 'senha123', 'coletor', 'ativo'),
('Benício Sales', 'benicio.sales@example.com', '10000000058', 'senha123', 'coletor', 'ativo'),
('Catarina Telles', 'catarina.telles@example.com', '10000000059', 'senha123', 'coordenador', 'ativo'),
('Davi Uchoa', 'davi.uchoa@example.com', '10000000060', 'senha123', 'coletor', 'desligado'),
('Emanuelly Valente', 'emanuelly.valente@example.com', '10000000061', 'senha123', 'coletor', 'ativo'),
('Francisco Wallner', 'francisco.wallner@example.com', '10000000062', 'senha123', 'coordenador', 'ativo'),
('Gael Yates', 'gael.yates@example.com', '10000000063', 'senha123', 'coletor', 'ativo'),
('Heloísa Zago', 'heloisa.zago@example.com', '10000000064', 'senha123', 'coletor', 'ativo'),
('Augusto Abrantes', 'augusto.abrantes@example.com', '10000000065', 'senha123', 'coordenador', 'desligado'),
('Bárbara Boaventura', 'barbara.boaventura@example.com', '10000000066', 'senha123', 'coletor', 'ativo'),
('Cecília Cordeiro', 'cecilia.cordeiro@example.com', '10000000067', 'senha123', 'coletor', 'ativo'),
('Eduardo Dutra', 'eduardo.dutra@example.com', '10000000068', 'senha123', 'coordenador', 'ativo'),
('Fernanda Evangelista', 'fernanda.evangelista@example.com', '10000000069', 'senha123', 'coletor', 'desligado'),
('Gustavo Fagundes', 'gustavo.fagundes@example.com', '10000000070', 'senha123', 'coletor', 'ativo'),
('Isaac Galvão', 'isaac.galvao@example.com', '10000000071', 'senha123', 'coordenador', 'ativo'),
('Joaquim Henriques', 'joaquim.henriques@example.com', '10000000072', 'senha123', 'coletor', 'ativo'),
('Luiza Inácio', 'luiza.inacio@example.com', '10000000073', 'senha123', 'coletor', 'ativo'),
('Mathias Jaques', 'mathias.jaques@example.com', '10000000074', 'senha123', 'coordenador', 'desligado'),
('Nathan Lacerda', 'nathan.lacerda@example.com', '10000000075', 'senha123', 'coletor', 'ativo'),
('Pérola Magalhães', 'perola.magalhaes@example.com', '10000000076', 'senha123', 'coletor', 'ativo'),
('Ryan Nascimento', 'ryan.nascimento@example.com', '10000000077', 'senha123', 'coordenador', 'ativo'),
('Thiago Oliva', 'thiago.oliva@example.com', '10000000078', 'senha123', 'coletor', 'desligado'),
('Vicente Pacheco', 'vicente.pacheco@example.com', '10000000079', 'senha123', 'coletor', 'ativo'),
('Alexia Quadros', 'alexia.quadros@example.com', '10000000080', 'senha123', 'coordenador', 'ativo'),
('Benjamin Rezende', 'benjamin.rezende@example.com', '10000000081', 'senha123', 'coletor', 'ativo'),
('Clarice Sampaio', 'clarice.sampaio@example.com', '10000000082', 'senha123', 'coletor', 'ativo'),
('Erick Toledo', 'erick.toledo@example.com', '10000000083', 'senha123', 'coordenador', 'desligado'),
('Isabel Veiga', 'isabel.veiga@example.com', '10000000084', 'senha123', 'coletor', 'ativo'),
('Levi Werner', 'levi.werner@example.com', '10000000085', 'senha123', 'coletor', 'ativo'),
('Marina Young', 'marina.young@example.com', '10000000086', 'senha123', 'coordenador', 'ativo'),
('Nicolas Zimer', 'nicolas.zimer@example.com', '10000000087', 'senha123', 'coletor', 'desligado'),
('Otávio Alencar', 'otavio.alencar@example.com', '10000000088', 'senha123', 'coletor', 'ativo'),
('Rebeca Belmonte', 'rebeca.belmonte@example.com', '10000000089', 'senha123', 'coordenador', 'ativo'),
('Theo Castanheira', 'theo.castanheira@example.com', '10000000090', 'senha123', 'coletor', 'ativo'),
('Valentim Dorneles', 'valentim.dorneles@example.com', '10000000091', 'senha123', 'coletor', 'ativo'),
('Yuri Espinoza', 'yuri.espinoza@example.com', '10000000092', 'senha123', 'coordenador', 'desligado'),
('Antônio Fogaça', 'antonio.fogaca@example.com', '10000000093', 'senha123', 'coletor', 'ativo'),
('Bento Gadelha', 'bento.gadelha@example.com', '10000000094', 'senha123', 'coletor', 'ativo'),
('Cauã Hilário', 'caua.hilario@example.com', '10000000095', 'senha123', 'coordenador', 'ativo'),
('Enzo Ipanema', 'enzo.ipanema@example.com', '10000000096', 'senha123', 'coletor', 'desligado'),
('Gael Junqueira', 'gael.junqueira@example.com', '10000000097', 'senha123', 'coletor', 'ativo'),
('Lucas Medeiros', 'lucas.medeiros@example.com', '10000000098', 'senha123', 'coordenador', 'ativo'),
('Matheus Noronha', 'matheus.noronha@example.com', '10000000099', 'senha123', 'coletor', 'ativo'),
('Vinícius Peixoto', 'vinicius.peixoto@example.com', '10000000100', 'senha123', 'coletor', 'ativo');


INSERT INTO comunicados (titulo, conteudo, autor_id) VALUES
-- Comunicado 1: Curto e Direto
('Lembrete de Segurança: Uso Obrigatório de EPIs', 'Apenas um lembrete rápido a todos: o uso de luvas e botas de segurança é obrigatório em todas as áreas de coleta e triagem. Sem exceções. A segurança de todos é nossa prioridade número um.', 1),

-- Comunicado 2: Médio com Quebra de Linha
('Atualização do Ponto de Encontro Matinal', 'Atenção, equipe.\n\nA partir de amanhã, o ponto de encontro para o início do turno será no Pátio B, ao lado do almoxarifado, e não mais no Pátio A. Isso visa facilitar a logística de saída dos veículos.\n\nSejam pontuais.', 2),

-- Comunicado 3: Longo
('Procedimento Detalhado para Coleta Seletiva em Condomínios Residenciais de Grande Porte', 'Para otimizar a coleta em condomínios com mais de 100 unidades, um novo procedimento foi estabelecido. Primeiramente, o motorista deve contatar o síndico ou zelador via rádio para anunciar a chegada. A equipe de coletores deve se dividir: dois coletores iniciarão a coleta pelos blocos pares, enquanto um coletor, auxiliado por um funcionário do condomínio, se dirigirá à área de descarte de volumosos. É crucial que todo o material reciclável seja inspecionado visualmente por contaminação antes de ser depositado no compartimento do caminhão. Qualquer não conformidade, como lixo orgânico misturado com recicláveis, deve ser registrada fotograficamente e comunicada imediatamente à coordenação para que o condomínio seja notificado. A eficiência neste processo é vital para mantermos nossas metas de reciclagem.', 3),

-- Comunicado 4: Médio
('Vagas de Estacionamento: Nova Organização', 'Para evitar congestionamentos, as vagas de estacionamento foram reorganizadas. Os caminhões de coleta agora devem estacionar exclusivamente na fileira norte (à esquerda da entrada). As vagas centrais são designadas para veículos de manutenção e supervisão. Carros particulares devem utilizar o estacionamento anexo. Placas de sinalização serão instaladas até o final da semana.', 1),

-- Comunicado 5: Muito Longo e Detalhado (Ótimo para testar o scroll do pop-up)
('Protocolo de Ação em Caso de Acidentes ou Incidentes Mecânicos Durante a Rota', 'Este comunicado estabelece o protocolo oficial a ser seguido em caso de qualquer incidente durante a operação de coleta. \n\n1. **Segurança em Primeiro Lugar:** Em caso de acidente, a primeira ação é garantir a segurança de todos os envolvidos. Sinalize a área imediatamente com os cones de segurança do veículo e acione o pisca-alerta. Preste os primeiros socorros se necessário e se tiver treinamento para tal. \n\n2. **Comunicação Imediata:** O motorista ou o chefe da equipe deve, sem demora, contatar a central de coordenação pelo rádio no canal de emergência (Canal 1), informando a localização exata, a natureza do incidente (colisão, pane mecânica, pneu furado, etc.) e se há feridos. \n\n3. **Registro do Incidente:** É mandatório o preenchimento do Relatório de Ocorrência de Rota (ROR) que se encontra no porta-luvas de todos os veículos. Detalhe o ocorrido, incluindo data, hora, local, veículos e pessoas envolvidas, e, se possível, colete o contato de testemunhas. Fotografe a cena de múltiplos ângulos, incluindo danos aos veículos e a sinalização utilizada. \n\n4. **Pane Mecânica:** Em caso de falha mecânica que imobilize o veículo, após comunicar a central, a equipe deve aguardar no local a chegada do time de suporte mecânico. Não tente realizar reparos complexos por conta própria, a menos que seja algo simples e que você tenha autorização e treinamento para fazer (ex: troca de uma lâmpada de farol). \n\n5. **Continuidade da Coleta:** A central de coordenação avaliará a situação e decidirá se um veículo reserva será enviado para que a equipe possa concluir a rota ou se a rota será suspensa e reprogramada. A equipe deve seguir estritamente as instruções recebidas da central. \n\nO cumprimento rigoroso deste protocolo é essencial para garantir a segurança e a eficiência operacional.', 2),

-- Comunicado 6: Curto
('Confraternização de Fim de Ano', 'Save the date! Nossa confraternização anual acontecerá no dia 19 de Dezembro, no salão de eventos principal. Mais detalhes sobre horários e atrações em breve. Contamos com a presença de todos!', 3),

-- Comunicado 7: Médio
('Feedback sobre o Novo App de Rotas', 'Agradecemos a todos que participaram da fase de testes do novo aplicativo de otimização de rotas. Recebemos muitos feedbacks valiosos e a equipe de TI já está trabalhando nas melhorias. A versão final será lançada no próximo mês para todos os veículos.', 1),

-- Comunicado 8: Longo
('Guia de Identificação e Separação de Materiais Perigosos Encontrados no Lixo Comum', 'Ocasionalmente, materiais perigosos como baterias de lítio, lâmpadas fluorescentes, latas de tinta e produtos químicos são descartados incorretamente no lixo comum ou reciclável. É de extrema importância que a equipe saiba identificar e manusear esses itens com segurança. Baterias de lítio, por exemplo, podem causar incêndios nos compartimentos dos caminhões se perfuradas ou esmagadas. Ao identificar um desses itens, utilize as luvas de proteção reforçadas, separe o material em um dos contêineres vermelhos de segurança localizados na parte externa do caminhão e notifique a coordenação ao final do turno. Nunca misture diferentes tipos de materiais perigosos no mesmo contêiner. Este procedimento protege não apenas a equipe, mas também toda a operação da usina de triagem.', 2),

-- Comunicado 9: Médio com Lista
('Checklist Obrigatório de Verificação do Veículo - Início do Turno', 'Lembrete: antes de iniciar a rota, todo motorista deve preencher o checklist de verificação do veículo. Itens a serem checados obrigatoriamente:\n- Nível do óleo e da água\n- Calibragem dos pneus\n- Funcionamento de faróis, setas e luz de ré\n- Condição dos freios (teste de freio em baixa velocidade no pátio)\n- Funcionamento do rádio de comunicação\n- Disponibilidade de EPIs e kit de primeiros socorros\nO formulário preenchido deve ser entregue ao supervisor do pátio antes da saída.', 3),

-- Comunicado 10: Curto
('Campanha de Vacinação contra a Gripe', 'A campanha de vacinação contra a gripe acontecerá na próxima quarta-feira, das 9h às 16h, na enfermaria da empresa. A vacinação é gratuita e recomendada a todos os colaboradores.', 1);

# Mensagens de suporte
INSERT INTO mensagens_suporte (nome, mensagem, status_mensagem) VALUES
('Lucas Ribeiro', 'O sensor da praça central não está respondendo.', 0),
('Fernanda Lima', 'Preciso de acesso ao painel de coordenador.', 1),
('Diego Souza', 'Aplicativo travando na tela de login.', 0),
('Patrícia Gomes', 'Sensor próximo ao mercado indica cheio o tempo todo.', 0);

# Histórico inicial (simulação)
INSERT INTO historico_sensores (id_sensor, statusLixo, data_registro) VALUES
(1, 'Vazia', NOW() - INTERVAL 2 DAY),
(2, 'Quase Cheia', NOW() - INTERVAL 1 DAY),
(3, 'Cheia', NOW() - INTERVAL 1 DAY),
(4, 'Vazia', NOW() - INTERVAL 3 DAY),
(5, 'Cheia', NOW());

#--- CONSULTAS DE TESTE -----------------------------------------------------------------------------------------------------------------
#SELECT * FROM UsuariosTrampo;
#SELECT * FROM RotasRelatorio;
#SELECT * FROM MensagensPendentes;
#SELECT * FROM StatusPorDia;