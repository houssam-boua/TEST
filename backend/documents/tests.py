from django.test import TestCase
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

class MinIOStorageTests(TestCase):
    def test_minio_file_upload_retrieve_delete(self):
        # Upload
        file_content = b"MinIO test file content"
        file_name = "minio_test_file.txt"
        file = ContentFile(file_content)
        saved_path = default_storage.save(file_name, file)
        self.assertTrue(default_storage.exists(saved_path))

        # Retrieve
        with default_storage.open(saved_path, "rb") as f:
            retrieved_content = f.read()
        self.assertEqual(retrieved_content, file_content)

        # Delete
        default_storage.delete(saved_path)
        self.assertFalse(default_storage.exists(saved_path))