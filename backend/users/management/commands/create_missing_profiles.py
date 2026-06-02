from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from users.models import UserProfile


class Command(BaseCommand):
    help = "Create UserProfile for all existing users who don't have one"

    def handle(self, *args, **options):
        users = User.objects.all()
        created_count = 0
        for user in users:
            _, created = UserProfile.objects.get_or_create(user=user)
            if created:
                created_count += 1
                self.stdout.write(f"Created profile for {user.username}")
        
        self.stdout.write(f"\nSuccessfully created {created_count} UserProfile(s)!")