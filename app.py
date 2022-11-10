# aiohttp server
import traceback

from aiohttp import web
import asyncio
from utils.config import DATABASE_DSN, PATH
from utils.db import Database
from utils.find_my import FindMyDevices, FindMyItems


async def hello(request):
    return web.Response(text="Hello, world")

async def api_local_get_devices(request):
    return web.json_response(await app['devices'].get())

async def api_local_get_items(request):
    return web.json_response(await app['items'].get())

async def api_db_get_latest(request):
    await app['db']._initdb()
    return web.json_response(await app['db'].get_latest())

async def update_database(app):
    try:
        while True:
            await asyncio.sleep(10)
            feed = await app['items'].get() + await app['devices'].get()
            for item in feed:
                try:
                    print('inserting', item)
                    await app['db'].insert(item)
                except asyncpg.exceptions.UniqueViolationError:
                    pass
                except:
                    traceback.print_exc()
    except asyncio.CancelledError:
        print('Background task cancelled')

async def background_tasks(app):
    app['update_database'] = asyncio.create_task(update_database(app))

    yield

    app['update_database'].cancel()
    await app['update_database']


if __name__ == "__main__":
    app = web.Application()
    app.add_routes([web.get('/', hello)])
    app.add_routes([web.get('/api/local/devices', api_local_get_devices)])
    app.add_routes([web.get('/api/local/items', api_local_get_items)])
    app.add_routes([web.get('/api/db/latest', api_db_get_latest)])
    # add background tasks
    app.cleanup_ctx.append(background_tasks)

    app['db'] = Database(DATABASE_DSN)
    app['items'] = FindMyItems(path=PATH)
    app['devices'] = FindMyDevices(path=PATH)
    web.run_app(app, host='0.0.0.0', port=8080)
