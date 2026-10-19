using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyThuVien.Api.Contracts;
using QuanLyThuVien.Application.Features.Members;
using QuanLyThuVien.Application.Features.Catalog;

namespace QuanLyThuVien.Api.Controllers;

[ApiController]
[Route("api/members")]
[Authorize]
public sealed class MembersController(MemberService memberService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<MemberListItem>>>> List([FromQuery] MemberQuery query, CancellationToken cancellationToken) => Ok(ApiEnvelope<PagedResult<MemberListItem>>.Success(await memberService.ListAsync(query, cancellationToken)));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiEnvelope<MemberDetails>>> Get(int id, CancellationToken cancellationToken) => Ok(ApiEnvelope<MemberDetails>.Success(await memberService.GetAsync(id, User.FindFirstValue(ClaimTypes.NameIdentifier), User.IsInRole("Staff") || User.IsInRole("Admin"), cancellationToken)));

    [HttpPost]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<ApiEnvelope<MemberDetails>>> Create(CreateMemberRequest request, CancellationToken cancellationToken) => Ok(ApiEnvelope<MemberDetails>.Success(await memberService.CreateAsync(request, cancellationToken)));

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<ActionResult<ApiEnvelope<MemberDetails>>> Update(int id, UpdateMemberRequest request, CancellationToken cancellationToken) => Ok(ApiEnvelope<MemberDetails>.Success(await memberService.UpdateAsync(id, request, cancellationToken)));
}
