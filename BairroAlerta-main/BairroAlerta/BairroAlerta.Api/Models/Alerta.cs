namespace BairroAlerta.Api.Models
{
    public class Alerta
    {
        public int Id { get; set; } // Identificador do alerta
        public string Tipo { get; set; } = string.Empty; // Tipo do alerta
        public string Descricao { get; set; } = string.Empty; // Detalhes do alerta
        public DateTime Data { get; set; } = DateTime.Now; // Data de criação
    }
}