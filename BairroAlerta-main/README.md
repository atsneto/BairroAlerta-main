📘 BairroAlerta – Sistema de Detecção de Alertas (Protótipo)

O BairroAlerta é uma aplicação composta por uma API em C# (.NET 10) e um Frontend Web, criada para simular um sistema de inteligência artificial capaz de detectar situações de risco em um bairro, como:

Movimentação estranha

Roubos

Agressões

Animais selvagens

A detecção é simulada via código, sem uso de IA real — ideal para aprendizado, TCCs, provas de conceito e demonstrações rápidas.

🏗️ Arquitetura do Projeto
BairroAlerta/
 ├── BairroAlerta.Api/      → Backend C# (ASP.NET Core Web API)
 └── BairroAlerta.Frontend/ → Frontend HTML, CSS e JavaScript

🚀 Tecnologias Utilizadas
Backend (API)

.NET 10

ASP.NET Core Web API

Entity Framework Core (InMemory)

Swagger

CORS habilitado

Programação orientada a serviços

Frontend

HTML5

CSS3

JavaScript (Fetch API)

Live Server (VSCode)

⚙️ 1. Como Executar o Projeto
▶️ Backend

Entre na pasta da API:

cd BairroAlerta.Api
dotnet run


Ela iniciará normalmente em:

http://localhost:5000
https://localhost:5001

Swagger disponível em:
http://localhost:5000/swagger

🌐 Frontend

Abra a pasta:

BairroAlerta.Frontend


Se estiver usando VSCode:

Clique com o botão direito em index.html

Escolha Open with Live Server

O frontend rodará em:

http://127.0.0.1:5500

📡 Comunicação Front ↔ API

O navegador bloqueia requisições para outras origens, por isso a API habilita CORS:

app.UseCors();


Isso permite que o frontend rode no 5500 e acesse a API no 5000.

📂 Estrutura do Backend
BairroAlerta.Api/
 ├── Controllers/
 │     └── AlertasController.cs
 ├── Data/
 │     └── AlertaContext.cs
 ├── Models/
 │     └── Alerta.cs
 ├── Services/
 │     ├── IDetectorService.cs
 │     └── FakeDetectorService.cs
 └── Program.cs

Principais Componentes
🔹 FakeDetectorService.cs

Simula uma IA gerando alertas aleatórios.

🔹 AlertasController.cs

Endpoints:

GET /api/alertas – lista todos os alertas

POST /api/alertas/detectar – gera um novo alerta falso

🔹 AlertaContext.cs

Banco de dados InMemory para testes.

🖼️ Estrutura do Frontend
BairroAlerta.Frontend/
 ├── index.html
 ├── style.css
 └── app.js

🔹 index.html

Interface com:

header

botão para detectar

lista de alertas

🔹 style.css

Tema escuro completo e interface moderna.

🔹 app.js

Faz chamadas GET e POST à API e exibe alertas na tela.

🧪 Testando o Sistema

Inicie a API (dotnet run)

Abra o frontend com o Live Server

Clique em Detectar Alerta

Um novo alerta aparecerá imediatamente

Recarregue a página → os alertas continuam (armazenados no InMemory enquanto a API estiver rodando)

📌 Possíveis Expansões Futuras

Dashboard com gráficos

Mapa com geolocalização dos alertas

Login e controle de usuários

Banco de dados real (PostgreSQL, SQL Server, MongoDB etc.)

Envio de notificações em tempo real (SignalR)

Integração com câmeras reais

IA verdadeira (YOLO, Azure Vision, TensorFlow etc.)

🏁 Conclusão

O BairroAlerta é um protótipo funcional ideal para estudos e demonstrações de:

APIs C# modernas

Comunicação frontend-backend

Simulação de IA

Arquitetura simples e escalável

Sinta-se à vontade para melhorar, expandir e personalizar o sistema!
