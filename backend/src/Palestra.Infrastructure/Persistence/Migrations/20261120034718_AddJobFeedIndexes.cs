using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Palestra.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddJobFeedIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_jobs_OwnerId",
                table: "jobs");

            migrationBuilder.CreateIndex(
                name: "IX_jobs_OwnerId_CreatedAt_Id",
                table: "jobs",
                columns: new[] { "OwnerId", "CreatedAt", "Id" },
                descending: new[] { false, true, true });

            migrationBuilder.CreateIndex(
                name: "IX_jobs_Status_CreatedAt_Id",
                table: "jobs",
                columns: new[] { "Status", "CreatedAt", "Id" },
                descending: new[] { false, true, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_jobs_OwnerId_CreatedAt_Id",
                table: "jobs");

            migrationBuilder.DropIndex(
                name: "IX_jobs_Status_CreatedAt_Id",
                table: "jobs");

            migrationBuilder.CreateIndex(
                name: "IX_jobs_OwnerId",
                table: "jobs",
                column: "OwnerId");
        }
    }
}
