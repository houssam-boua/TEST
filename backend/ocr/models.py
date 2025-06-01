from django.db import models

# Create your models here.
class Invoice(models.Model):
    """
    Represents an invoice in the system.
    Includes metadata such as invoice number, date, amount, and status.
    """
    store_name = models.CharField(max_length=255)
    store_address = models.CharField(max_length=255)
    store_phone = models.CharField(max_length=20)
    # invoice_number = models.CharField(max_length=50, unique=True)
    invoice_date = models.DateTimeField(auto_now_add=True)
    invoice_amount = models.DecimalField(max_digits=10, decimal_places=2)
    # invoice_status = models.CharField(max_length=20, choices=[
    #     ('pending', 'Pending'),
    #     ('paid', 'Paid'),
    #     ('overdue', 'Overdue')
    # ])
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.status}"