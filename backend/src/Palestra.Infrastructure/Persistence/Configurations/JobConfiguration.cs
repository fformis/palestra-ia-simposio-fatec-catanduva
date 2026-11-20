using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Palestra.Domain.Auth;
using Palestra.Domain.Jobs;

namespace Palestra.Infrastructure.Persistence.Configurations;

public class JobConfiguration : IEntityTypeConfiguration<Job>
{
    public void Configure(EntityTypeBuilder<Job> b)
    {
        b.ToTable("jobs");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever();
        b.Property(x => x.Title).HasMaxLength(100).IsRequired();
        b.Property(x => x.Company).HasMaxLength(JobLimits.MaxCompanyLength);
        b.Property(x => x.Description).HasMaxLength(JobLimits.MaxDescriptionStoredLength).IsRequired();
        b.PrimitiveCollection(x => x.Benefits).ElementType().HasConversion<string>();
        b.Property(x => x.ContractType).HasConversion<string>().HasMaxLength(10);
        b.Property(x => x.Salary).HasPrecision(12, 2);
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(10);
        b.HasIndex(x => x.OwnerId);
        b.HasOne<User>().WithMany().HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class JobImageConfiguration : IEntityTypeConfiguration<JobImage>
{
    public void Configure(EntityTypeBuilder<JobImage> b)
    {
        b.ToTable("job_images");
        b.HasKey(x => x.JobId);
        b.Property(x => x.JobId).ValueGeneratedNever();
        b.Property(x => x.ContentType).HasMaxLength(20).IsRequired();
        b.Property(x => x.Content).IsRequired();
        b.HasOne<Job>().WithOne().HasForeignKey<JobImage>(x => x.JobId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class JobLikeConfiguration : IEntityTypeConfiguration<JobLike>
{
    public void Configure(EntityTypeBuilder<JobLike> b)
    {
        b.ToTable("job_likes");
        b.HasKey(x => new { x.JobId, x.UserId });
        b.HasOne<Job>().WithMany().HasForeignKey(x => x.JobId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class JobApplicationConfiguration : IEntityTypeConfiguration<JobApplication>
{
    public void Configure(EntityTypeBuilder<JobApplication> b)
    {
        b.ToTable("job_applications");
        b.HasKey(x => new { x.JobId, x.UserId });
        b.HasOne<Job>().WithMany().HasForeignKey(x => x.JobId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
