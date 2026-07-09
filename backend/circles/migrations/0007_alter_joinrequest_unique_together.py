from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("circles", "0006_resource"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name="joinrequest",
            unique_together={("user", "circle", "status")},
        ),
    ]
