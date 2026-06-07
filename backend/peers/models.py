from django.db import models
from django.contrib.auth.models import User


class CollaborationRequest(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    )

    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_collaboration_requests"
    )
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_collaboration_requests"
    )
    message = models.TextField(max_length=500, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending", db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("sender", "receiver")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.sender} → {self.receiver} ({self.status})"
