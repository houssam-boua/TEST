from rest_framework import serializers
from .models import Invoice

class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice model."""
    
    class Meta:
        model = Invoice
        fields = "__all__"
        # read_only_fields = ['id', 'invoice_date']  # Assuming these fields should not be set by the user