import requests
import logging
import wikipedia
import re

from django.http import JsonResponse

from .models import Country, Post


# ====== СОЗДАТЬ ФУНКЦИЮ ДЛЯ РЕНДЕРА ИНФОРМАЦИИ О 
# ПОСТАХ ДЛЯ ОТРИСОВКИ МЕТОК НА КАРТЕ ======


def getting_info_from_nominatim_api(latitude, longitude):
    nominatim_url = f'https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json'

    response = requests.get(nominatim_url)
    
    try: 
        response.status_code == 200
        data = response.json()
        address = data.get('address', {})
        street = address.get('road', 'Неизвестно')
        city = address.get('city', address.get('town', address.get('village', 'Неизвестно')))
        country = address.get('country', 'Неизвестно')

        return street, city, country

    except Exception as e:
        logging.error(f'Ошибка: {e}')
        return None, None, None


def get_capital(text):
    match = re.search(r'столица(?: страны)?[:\s]*([\w\s]+)', text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None


def get_president(text):
    match = re.search(r'(президента|президент):?\s*([\w\s]+)', text, re.IGNORECASE)
    if match:
        return match.group(2).strip()
    return None


def get_population(text):
    match = re.search(r'население[:\s]*([\d\s]+)', text)
    if match:
        return match.group(1).strip()
    return None


def getting_info_from_wiki_api(country_name):
    wikipedia.set_lang("ru")
    page = wikipedia.page(country_name)

    description = page.summary
    capital = get_capital(page.content)
    president = get_president(page.content)
    population = get_population(page.content)

    return description, capital, president, population


def render_country_info_from_api(request):
    countries = Country.objects.all()

    country_json = {}

    for country in countries:
        description, capital, president, population = getting_info_from_wiki_api(country.name)
        country_info = {
            'name': country.name,
            'coordinate': {
                'lat': country.latitude,
                'lng': country.longitude,
            },
            'description': description,
            'country_info': {
                "capital": capital,
                "president": president,
                "population": population
            },
            "image": country.image
        }
        country_json.append(country_info)
    return JsonResponse(country_json, json_dumps_params={'indent': 2, 'ensure_ascii': False})


def render_post_info_from_api(request):
    posts = Post.objects.all()

    post_json = {}

    for post in posts:
        street, city, country = getting_info_from_nominatim_api(post.latitude, post.longitude)
        post_info = {
            "id": post.id,
            "image": [
                post.image
            ],
            "description": post.description,
            "coordinate": {
                "lat": post.latitude,
                "lng": post.longitude
            },
            "date": post.created_at,
            "address": {
                "street": street,
                "city": city,
                "country": country
            }
        }
        post_json.append(post_info)
    return JsonResponse(post_json, json_dumps_params={'indent': 2, 'ensure_ascii': False})

