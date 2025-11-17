DROP DATABASE EcoFlowBD;
CREATE DATABASE EcoFlowBD;
USE EcoFlowBD;




#--- Administrador -----------------------------------------------------------------------------------------------------------------
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sexo ENUM('masculino', 'feminino', 'outros') DEFAULT 'outros',
    cpf VARCHAR(255) NOT NULL UNIQUE,
    estadoCivil ENUM('solteiro(a)', 'casado(a)','viuvo(a)','divorciado(a)') NOT NULL DEFAULT 'solteiro(a)' ,
    senha VARCHAR(255) NOT NULL,
    CEP VARCHAR(8) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE ,
    cargo ENUM('administrador', 'coordenador', 'coletor') DEFAULT 'coletor',
    statusConta ENUM('ativo', 'desligado') DEFAULT 'ativo',
    codigo_recuperacao VARCHAR(6) NULL,   
    expiracao_codigo TIMESTAMP NULL,
    token_verificacao VARCHAR(255) NULL,
    expiracao_token_verificacao TIMESTAMP NULL
);
#--- Sensor IOT -----------------------------------------------------------------------------------------------------------------
CREATE TABLE SistemaSensor(
	id_Sensor INT AUTO_INCREMENT PRIMARY KEY,
    statusLixo ENUM ('Cheia','Quase Cheia','Vazia') DEFAULT 'Vazia', # ver dps se deixa "Quase Cheia" ou "Metade" checar na documentaçao
    localizacao POINT,
    Endereco VARCHAR(255)
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
SELECT SistemaSensor.id_Sensor AS ID, SistemaSensor.statusLixo AS Stats, SistemaSensor.Endereco AS Endereco, SistemaSensor.localizacao AS Coordenadas
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





INSERT INTO usuarios (nome, sexo, cpf, estadoCivil, senha, CEP, email, cargo, statusConta) VALUES
('Miguel', 'masculino', '00000000000', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '12345001', 'miguel@example.com', 'administrador', 'ativo'),
('Lalau', 'masculino', '49256740810', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '23456002', 'lalau@example.com', 'coordenador', 'ativo'),
('Gustavo', 'masculino', '00000000002', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '34567003', 'gustavo@example.com', 'coordenador', 'ativo'),
('Carla Dias', 'feminino', '10000000003', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '45678004', 'carla.dias@example.com', 'coletor', 'desligado'),
('Daniel Farias', 'masculino', '10000000004', 'divorciado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '56789005', 'daniel.farias@example.com', 'coletor', 'ativo'),
('Elisa Gomes', 'feminino', '10000000005', 'viuvo(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '67890006', 'elisa.gomes@example.com', 'coordenador', 'ativo'),
('Fábio Rocha', 'masculino', '10000000006', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '78901007', 'fabio.rocha@example.com', 'coletor', 'ativo'),
('Gabriela Lima', 'feminino', '10000000007', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '89012008', 'gabriela.lima@example.com', 'coletor', 'desligado'),
('Henrique Martins', 'masculino', '10000000008', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '90123009', 'henrique.martins@example.com', 'coordenador', 'ativo'),
('Isabela Nogueira', 'feminino', '10000000009', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '11223010', 'isabela.nogueira@example.com', 'coletor', 'ativo'),
('João Pereira', 'masculino', '10000000010', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '22334011', 'joao.pereira@example.com', 'coletor', 'ativo'),
('Larissa Barbosa', 'feminino', '10000000011', 'divorciado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '33445012', 'larissa.barbosa@example.com', 'coordenador', 'desligado'),
('Marcos Ribeiro', 'masculino', '10000000012', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '44556013', 'marcos.ribeiro@example.com', 'coletor', 'ativo'),
('Natália Sousa', 'feminino', '10000000013', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '55667014', 'natalia.sousa@example.com', 'coletor', 'ativo'),
('Otávio Azevedo', 'masculino', '10000000014', 'viuvo(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '66778015', 'otavio.azevedo@example.com', 'coordenador', 'ativo'),
('Patrícia Ferreira', 'feminino', '10000000015', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '77889016', 'patricia.ferreira@example.com', 'coletor', 'desligado'),
('Quintino Barros', 'masculino', '10000000016', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '88990017', 'quintino.barros@example.com', 'coletor', 'ativo'),
('Renata Cardoso', 'feminino', '10000000017', 'divorciado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '99001018', 'renata.cardoso@example.com', 'coordenador', 'ativo'),
('Sérgio Tavares', 'masculino', '10000000018', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '10112019', 'sergio.tavares@example.com', 'coletor', 'ativo'),
('Tatiane Vasconcelos', 'feminino', '10000000019', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '21223020', 'tatiane.vasconcelos@example.com', 'coletor', 'ativo'),
('Ulisses Brandão', 'masculino', '10000000020', 'viuvo(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '32334021', 'ulisses.brandao@example.com', 'coordenador', 'desligado'),
('Vanessa Moraes', 'feminino', '10000000021', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '43445022', 'vanessa.moraes@example.com', 'coletor', 'ativo'),
('Wagner Pinto', 'masculino', '10000000022', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '54556023', 'wagner.pinto@example.com', 'coletor', 'ativo'),
('Ximena Freitas', 'feminino', '10000000023', 'divorciado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '65667024', 'ximena.freitas@example.com', 'coordenador', 'ativo'),
('Yasmin Correia', 'feminino', '10000000024', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '76778025', 'yasmin.correia@example.com', 'coletor', 'ativo'),
('Zeca Drummond', 'masculino', '10000000025', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '87889026', 'zeca.drummond@example.com', 'coletor', 'desligado'),
('Alice Salgado', 'feminino', '10000000026', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '98990027', 'alice.salgado@example.com', 'coordenador', 'ativo'),
('Bernardo Campos', 'masculino', '10000000027', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '11001028', 'bernardo.campos@example.com', 'coletor', 'ativo'),
('Clara Siqueira', 'feminino', '10000000028', 'divorciado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '22112029', 'clara.siqueira@example.com', 'coletor', 'ativo'),
('Davi Queiroz', 'masculino', '10000000029', 'viuvo(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '33223030', 'davi.queiroz@example.com', 'coordenador', 'desligado'),
('Esther Neves', 'feminino', '10000000030', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '44334031', 'esther.neves@example.com', 'coletor', 'ativo'),
('Felipe Viana', 'masculino', '10000000031', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '55445032', 'felipe.viana@example.com', 'coletor', 'ativo'),
('Giovanna Justo', 'feminino', '10000000032', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '66556033', 'giovanna.justo@example.com', 'coordenador', 'ativo'),
('Heitor Xavier', 'masculino', '10000000033', 'divorciado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '77667034', 'heitor.xavier@example.com', 'coletor', 'desligado'),
('Íris Zanetti', 'feminino', '10000000034', 'viuvo(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '88778035', 'iris.zanetti@example.com', 'coletor', 'ativo'),
('Júlio Pires', 'masculino', '10000000035', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '99889036', 'julio.pires@example.com', 'coordenador', 'ativo'),
('Lorena Ramos', 'feminino', '10000000036', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '10990037', 'lorena.ramos@example.com', 'coletor', 'ativo'),
('Murilo Castilho', 'masculino', '10000000037', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '21001038', 'murilo.castilho@example.com', 'coletor', 'ativo'),
('Nicole Dantas', 'feminino', '10000000038', 'divorciado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '32112039', 'nicole.dantas@example.com', 'coordenador', 'desligado'),
('Otávio Guerra', 'masculino', '10000000039', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '43223040', 'otavio.guerra@example.com', 'coletor', 'ativo'),
('Pietra Juncos', 'feminino', '10000000040', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '54334041', 'pietra.juncos@example.com', 'coletor', 'ativo'),
('Rafael Lemos', 'masculino', '10000000041', 'viuvo(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '65445042', 'rafael.lemos@example.com', 'coordenador', 'ativo'),
('Sofia Arantes', 'feminino', '10000000042', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '76556043', 'sofia.arantes@example.com', 'coletor', 'desligado'),
('Théo Borges', 'masculino', '10000000043', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '87667044', 'theo.borges@example.com', 'coletor', 'ativo'),
('Valentina Chaves', 'feminino', '10000000044', 'divorciado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '98778045', 'valentina.chaves@example.com', 'coordenador', 'ativo'),
('Arthur da Mata', 'masculino', '10000000045', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '10889046', 'arthur.da.mata@example.com', 'coletor', 'ativo'),
('Beatriz Esteves', 'feminino', '10000000046', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '21990047', 'beatriz.esteves@example.com', 'coletor', 'ativo'),
('Caio Fortes', 'masculino', '10000000047', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '32001048', 'caio.fortes@example.com', 'coordenador', 'desligado'),
('Helena Guedes', 'feminino', '10000000048', 'viuvo(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '43112049', 'helena.guedes@example.com', 'coletor', 'ativo'),
('Isadora Ibarra', 'feminino', '10000000049', 'divorciado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '54223050', 'isadora.ibarra@example.com', 'coletor', 'ativo'),
('Leonardo Jardim', 'masculino', '10000000050', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '65334051', 'leonardo.jardim@example.com', 'coordenador', 'ativo'),
('Manuela Lobato', 'feminino', '10000000051', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '76445052', 'manuela.lobato@example.com', 'coletor', 'desligado'),
('Noah Menezes', 'outros', '10000000052', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '87556053', 'noah.menezes@example.com', 'coletor', 'ativo'),
('Olívia Novais', 'feminino', '10000000053', 'viuvo(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '98667054', 'olivia.novais@example.com', 'coordenador', 'ativo'),
('Pedro Otero', 'masculino', '10000000054', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '10778055', 'pedro.otero@example.com', 'coletor', 'ativo'),
('Rafaela Padilha', 'feminino', '10000000055', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '21889056', 'rafaela.padilha@example.com', 'coletor', 'ativo'),
('Samuel Quintanilha', 'masculino', '10000000056', 'divorciado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '32990057', 'samuel.quintanilha@example.com', 'coordenador', 'desligado'),
('Vitória Rangel', 'feminino', '10000000057', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '43001058', 'vitoria.rangel@example.com', 'coletor', 'ativo'),
('Benício Sales', 'masculino', '10000000058', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '54112059', 'benicio.sales@example.com', 'coletor', 'ativo'),
('Catarina Telles', 'feminino', '10000000059', 'viuvo(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '65223060', 'catarina.telles@example.com', 'coordenador', 'ativo'),
('Davi Uchoa', 'masculino', '10000000060', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '76334061', 'davi.uchoa@example.com', 'coletor', 'desligado'),
('Emanuelly Valente', 'feminino', '10000000061', 'solteiro(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '87445062', 'emanuelly.valente@example.com', 'coletor', 'ativo'),
('Francisco Wallner', 'masculino', '10000000062', 'divorciado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '98556063', 'francisco.wallner@example.com', 'coordenador', 'ativo'),
('Vinícius Peixoto', 'masculino', '10000000100', 'casado(a)', '$2b$10$xRQRqdge5icnyalUz/01CufDtnfjzwQgesERApYU6AOEoejFEE3gO', '10667064', 'vinicius.peixoto@example.com', 'coletor', 'ativo');
select *from usuarios;

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