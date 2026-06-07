# Generated migration for refactoring profile system
from django.db import migrations, models


def check_domain_field_exists(apps, schema_editor):
    """Check if domain field exists"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0004_userprofile_availability_userprofile_github_and_more"),
    ]

    operations = [
        # Remove tech_stack field
        migrations.RemoveField(
            model_name="userprofile",
            name="tech_stack",
        ),
        # Add domain field
        migrations.AddField(
            model_name="userprofile",
            name="domain",
            field=models.CharField(
                blank=True,
                choices=[
                    ("math", "Mathematics"),
                    ("physics", "Physics"),
                    ("chemistry", "Chemistry"),
                    ("biology", "Biology"),
                    ("cs", "Computer Science"),
                    ("engineering", "Engineering"),
                    ("other", "Other STEM"),
                ],
                help_text="Primary STEM domain of focus",
                max_length=50,
                null=True,
            ),
        ),
    ]
