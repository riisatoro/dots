# Generated by Django 3.1.1 on 2020-10-02 05:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_auto_20200923_1328'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='match',
            name='user',
        ),
    ]