using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BairroAlerta.Api.Services;
using BairroAlerta.Api.Models;
using BairroAlerta.Api.Data;

namespace BairroAlerta.Api.Controllers
{
    // Indica que esta classe é um controlador de API (recebe requisições HTTP)
    [ApiController]

    // Define o caminho base das rotas: /api/alertas
    [Route("api/[controller]")]
    public class AlertasController : ControllerBase
    {
        // Representa o local onde os alertas seriam guardados (memória)
        private readonly AlertaContext _context;

        // Serviço responsável por gerar alertas fake
        private readonly IDetectorService _detector;

        // Construtor: recebe as dependências e guarda nas variáveis acima
        public AlertasController(AlertaContext context, IDetectorService detector)
        {
            _context = context;
            _detector = detector;
        }

        // Rota GET /api/alertas
        // Retorna todos os alertas registrados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Alerta>>> Get()
        {
            // Busca todos os alertas; se não houver banco real, apenas retorna lista vazia
            return await _context.Alertas.ToListAsync();
        }

        // Rota POST /api/alertas/detectar
        // Gera um alerta falso e retorna para quem chamou
        [HttpPost("detectar")]
        public async Task<ActionResult<Alerta>> Detectar()
        {
            // Gera um alerta simulado usando o serviço de detecção
            var alerta = _detector.GerarAlertaFake();

            // Adiciona o alerta à lista (em banco ou memória)
            _context.Alertas.Add(alerta);

            // Salva as alterações (ou simplesmente ignora, caso não haja banco)
            await _context.SaveChangesAsync();

            // Retorna o alerta recém-criado para o cliente (Swagger, JS, etc.)
            return Ok(alerta);
        }
    }
}