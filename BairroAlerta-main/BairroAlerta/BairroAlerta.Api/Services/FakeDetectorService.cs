using BairroAlerta.Api.Models;

namespace BairroAlerta.Api.Services
{
    public class FakeDetectorService : IDetectorService
    {
        // Tipos possíveis de alerta
        private static readonly string[] Tipos = new[]
        {
            "Roubo",
            "Agressão",
            "Animal Selvagem",
            "Movimentação Estranha"
        };

        public Alerta GerarAlertaFake()
        {
            var random = new Random(); // Gera números aleatórios
            string tipo = Tipos[random.Next(Tipos.Length)]; // Escolhe um tipo

            // Cria alerta fake
            return new Alerta
            {
                Tipo = tipo,
                Descricao = $"Possível ocorrência detectada: {tipo}",
                Data = DateTime.Now
            };
        }
    }
}