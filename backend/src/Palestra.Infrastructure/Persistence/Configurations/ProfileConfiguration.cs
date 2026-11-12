using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Palestra.Domain.Auth;
using Palestra.Domain.Profiles;

namespace Palestra.Infrastructure.Persistence.Configurations;

public class ProfileConfiguration : IEntityTypeConfiguration<Profile>
{
    public void Configure(EntityTypeBuilder<Profile> b)
    {
        b.ToTable("profiles");
        b.HasKey(x => x.UserId);
        b.Property(x => x.UserId).ValueGeneratedNever();
        b.Property(x => x.Bio).HasMaxLength(500);
        b.HasOne<User>().WithOne().HasForeignKey<Profile>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProfilePhotoConfiguration : IEntityTypeConfiguration<ProfilePhoto>
{
    public void Configure(EntityTypeBuilder<ProfilePhoto> b)
    {
        b.ToTable("profile_photos");
        b.HasKey(x => x.UserId);
        b.Property(x => x.UserId).ValueGeneratedNever();
        b.Property(x => x.ContentType).HasMaxLength(20).IsRequired();
        b.Property(x => x.Content).IsRequired();
        b.HasOne<User>().WithOne().HasForeignKey<ProfilePhoto>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class OccupationConfiguration : IEntityTypeConfiguration<Occupation>
{
    public void Configure(EntityTypeBuilder<Occupation> b)
    {
        b.ToTable("occupations");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever();
        b.Property(x => x.Title).HasMaxLength(150).IsRequired();
        b.Property(x => x.Company).HasMaxLength(150).IsRequired();
        b.Property(x => x.Description).HasMaxLength(1000);
        b.HasIndex(x => x.UserId);
        b.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class EducationConfiguration : IEntityTypeConfiguration<Education>
{
    public void Configure(EntityTypeBuilder<Education> b)
    {
        b.ToTable("educations");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever();
        b.Property(x => x.Institution).HasMaxLength(150).IsRequired();
        b.Property(x => x.Course).HasMaxLength(150).IsRequired();
        b.Property(x => x.Level).HasConversion<string>().HasMaxLength(20);
        b.Property(x => x.Description).HasMaxLength(1000);
        b.HasIndex(x => x.UserId);
        b.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> b)
    {
        b.ToTable("courses");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).ValueGeneratedNever();
        b.Property(x => x.Name).HasMaxLength(150).IsRequired();
        b.Property(x => x.Institution).HasMaxLength(150).IsRequired();
        b.HasIndex(x => x.UserId);
        b.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
