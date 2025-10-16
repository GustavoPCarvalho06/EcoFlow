
DROP DATABASE EcoFlowBD;
CREATE DATABASE EcoFlowBD;
USE EcoFlowBD;

#--- Administrador -----------------------------------------------------------------------------------------------------------------
CREATE TABLE usuarios (
	id_admin INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
	cpf VARCHAR(14) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
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

CREATE TABLE historico_sensores (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_sensor INT,
    statusLixo ENUM('Cheia','Quase Cheia','Vazia') NOT NULL,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sensor) REFERENCES SistemaSensor(id_Sensor)
);


#--- VIEWS -----------------------------------------------------------------------------------------------------------------
# Relatorio das Rotas
CREATE VIEW RotasRelatorio AS
SELECT SistemaSensor.id_Sensor AS ID, SistemaSensor.statusLixo AS Stats, SistemaSensor.localizacao AS Coordenadas
FROM SistemaSensor;

# Relatório de Usuários Ativos
CREATE VIEW UsuariosTrampo AS
SELECT usuarios.id_admin AS ID, usuarios.nome AS Nome, usuarios.cargo AS Cargo, usuarios.statusConta AS Status
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


SELECT * FROM usuarios;
SELECT * FROM RotasRelatorio;


#--- INSERTS PARA TEST -----------------------------------------------------------------------------------------------------------------
INSERT INTO SistemaSensor (statusLixo, localizacao) VALUES
('Vazia', ST_GeomFromText('POINT(-46.557282 -23.647222)')),
('Quase Cheia', ST_GeomFromText('POINT(-46.555083 -23.645723)')),
('Cheia', ST_GeomFromText('POINT(-46.552413 -23.644962)')),
('Vazia', ST_GeomFromText('POINT(-46.556209 -23.640472)')),
('Quase Cheia', ST_GeomFromText('POINT(-46.560171 -23.643114)')),
('Cheia', ST_GeomFromText('POINT(-46.560212 -23.646610)'));
