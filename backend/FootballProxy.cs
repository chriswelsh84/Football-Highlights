using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Net.Http;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});
var app = builder.Build();
app.UseCors();

const string API_KEY = "e536a6308caf43399a551a1332ae401b";
const string BASE_URL = "https://api.football-data.org/v4";

app.MapGet("/api/{*endpoint}", async (HttpContext context, string endpoint) =>
{
    using var client = new HttpClient();
    client.DefaultRequestHeaders.Add("X-Auth-Token", API_KEY);
    var url = $"{BASE_URL}/{endpoint}{(context.Request.QueryString.HasValue ? context.Request.QueryString.Value : "")}";
    var response = await client.GetAsync(url);
    var content = await response.Content.ReadAsStringAsync();
    context.Response.ContentType = "application/json";
    context.Response.StatusCode = (int)response.StatusCode;
    await context.Response.WriteAsync(content);
});

app.Run();
