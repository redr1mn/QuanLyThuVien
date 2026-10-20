using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace QuanLyThuVien.Tests.Api;

public sealed class ApiOnlyStartupTests
{
    [Fact]
    public async Task Root_does_not_serve_a_server_rendered_application()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

        using var response = await client.GetAsync("/");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
