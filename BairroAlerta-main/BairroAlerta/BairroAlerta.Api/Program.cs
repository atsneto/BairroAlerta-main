using Microsoft.EntityFrameworkCore;
using BairroAlerta.Api.Data;
using BairroAlerta.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS liberado para o front conectar ao backend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

//Cria um banco de dados temporário na memória
builder.Services.AddDbContext<AlertaContext>(opt =>
    opt.UseInMemoryDatabase("BairroAlertaDB"));

//Sempre que o sistema pedir IDetectorService, ele cria uma instância de FakeDetectorService.
builder.Services.AddScoped<IDetectorService, FakeDetectorService>();

//Controllers e Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

//Autoriza o navegador a fazer requisições ao backend
app.UseCors(); // <<< IMPORTANTE

//Swagger
app.UseSwagger();
app.UseSwaggerUI();

//Faz endpoints como /alertas, /sensores, /ocorrencias etc funcionarem.
app.MapControllers();

app.Run();
