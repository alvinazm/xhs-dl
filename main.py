from asyncio import run
from asyncio.exceptions import CancelledError
from contextlib import suppress
from sys import argv

from source import Settings
from source import XHS
from source import XHSDownloader
from source import cli


async def app():
    async with XHSDownloader() as xhs:
        await xhs.run_async()


async def api_server(
    host="0.0.0.0",
    port=5556,
    log_level="info",
):
    async with XHS(**Settings().run()) as xhs:
        await xhs.run_api_server(
            host,
            port,
            log_level,
        )


async def mcp_server(
    transport="streamable-http",
    host="127.0.0.0",
    port=5556,
    log_level="INFO",
):
    async with XHS(**Settings().run()) as xhs:
        await xhs.run_mcp_server(
            transport=transport,
            host=host,
            port=port,
            log_level=log_level,
        )


if __name__ == "__main__":
    with suppress(
        KeyboardInterrupt,
        CancelledError,
    ):
        # TODO: 重构优化
        if len(argv) == 1:
            run(api_server())
            # 默认启动Web界面模式，访问 http://127.0.0.1:5556
        elif argv[1].upper() == "API" or argv[1].upper() == "WEB":
            run(api_server())
            # WEB 模式启动后会自动打开浏览器并访问 http://127.0.0.1:5556
        elif argv[1].upper() == "MCP":
            run(mcp_server())
            # run(mcp_server("stdio"))
        elif argv[1].upper() == "CLI":
            cli()
        else:
            cli()
