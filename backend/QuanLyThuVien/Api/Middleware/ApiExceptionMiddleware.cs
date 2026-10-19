using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using QuanLyThuVien.Api.Contracts;
using QuanLyThuVien.Application.Features.Members;
using QuanLyThuVien.Application.Features.Circulation;
using QuanLyThuVien.Application.Features.Reservations;

namespace QuanLyThuVien.Api.Middleware;

public sealed class ApiExceptionMiddleware(RequestDelegate next, ILogger<ApiExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.BadRequest, "validation_error", exception.Message);
        }
        catch (ForbiddenException exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.Forbidden, "forbidden", exception.Message);
        }
        catch (ReservationForbiddenException exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.Forbidden, "forbidden", exception.Message);
        }
        catch (ConflictException exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.Conflict, "conflict", exception.Message);
        }
        catch (CirculationForbiddenException exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.Forbidden, "forbidden", exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            await WriteErrorAsync(context, HttpStatusCode.NotFound, "not_found", exception.Message);
        }
        catch (Exception exception) when (!context.Response.HasStarted)
        {
            logger.LogError(exception, "Unhandled API exception for {Path}", context.Request.Path);
            await WriteErrorAsync(context, HttpStatusCode.InternalServerError, "server_error", "Đã xảy ra lỗi máy chủ.");
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, HttpStatusCode statusCode, string code, string message)
    {
        if (!context.Request.Path.StartsWithSegments("/api"))
            throw new InvalidOperationException(message);

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(
            ApiEnvelope<object>.Failure(new ApiError(code, message))));
    }
}
