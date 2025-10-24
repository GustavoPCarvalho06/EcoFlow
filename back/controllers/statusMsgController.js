import {readFilterRelatorio, readAllRelatorio, readFilterBetweenRelatorio} from "../models/statusMsgModel.js"



const readFilterstatusSensorRotasController = async (req, res) => {
    try {
      const { key, value } = req.body; 
      if (!key || !value) {
        return res.status(400).json({ mensagem: "Parâmetros key e value são obrigatórios" });
      }
      return res.status(200).json({
        mensagem: await readFilterRelatorio({ key, value })
      });
    } catch (err) {
      console.error("Erro ao Ler meus Chamados: ", err);
      return res.status(400).json({ mensagem: "Erro ao ler meus chamados" });
    }
  };
  


  const readFilterBetweenStatusSensorRotasController = async (req, res) => {
    try {
        const { key, firstValue, secondValue } = req.body;

        if (!key || !firstValue || !secondValue) {
            return res.status(400).json({ mensagem: "Parâmetros key, firstValue e secondValue são obrigatórios" });
        }

        const resultado = await readFilterBetweenRelatorio({ key, firstValue, secondValue });
        return res.status(200).json({ mensagem: resultado });

    } catch (err) {
        console.error("Erro ao Ler meus Chamados: ", err);
        return res.status(400).json({ mensagem: "Erro ao ler meus chamados" });
    }
};

const readAllUserController = async (req,res) =>{
    try {
        
        return res.status(200).json(await readAllRelatorio())
    } catch (err) {
        console.error("Erro ao Ler meus Chamdos: ", err)
        return res.status(400).json({mensagem:"Erro ao ler meus Usuarios"})
    }
};

export default{readFilterBetweenStatusSensorRotasController, readAllUserController, readFilterstatusSensorRotasController}