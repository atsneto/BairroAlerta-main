using BairroAlerta.Api.Models;

namespace BairroAlerta.Api.Services
{
    // Interface do serviço de detecção
    public interface IDetectorService
    {
        Alerta GerarAlertaFake(); // Método para criar alerta falso
    }
}