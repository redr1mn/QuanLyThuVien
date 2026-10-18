namespace QuanLyThuVien.Api.Contracts;

public sealed record ApiEnvelope<T>(T? Data, IReadOnlyCollection<ApiError> Errors)
{
    public static ApiEnvelope<T> Success(T data) => new(data, Array.Empty<ApiError>());

    public static ApiEnvelope<T> Failure(params ApiError[] errors) => new(default, errors);
}
