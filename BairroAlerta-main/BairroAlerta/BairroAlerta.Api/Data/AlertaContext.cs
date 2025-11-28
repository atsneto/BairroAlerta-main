using Microsoft.EntityFrameworkCore;
using BairroAlerta.Api.Models;

namespace BairroAlerta.Api.Data
{
    // Contexto do Entity Framework DbContext (acesso a dados)
    public class AlertaContext : DbContext
    {
        // Recebe configurações do banco
        public AlertaContext(DbContextOptions<AlertaContext> options)
            : base(options) {}

        // Tabela de Alertas
        public DbSet<Alerta> Alertas { get; set; }
    }
}