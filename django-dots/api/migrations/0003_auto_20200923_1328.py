# Generated by Django 3.1.1 on 2020-09-23 10:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_match_user'),
    ]

    operations = [
        migrations.RenameField(
            model_name='match',
            old_name='lose_score',
            new_name='loose_score',
        ),
    ]
