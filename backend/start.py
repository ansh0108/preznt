"""
Dual-stack launcher for uvicorn.

Railway's edge proxy reaches containers over IPv6, while its health check /
loopback path can use IPv4. A plain `--host 0.0.0.0` (IPv4-only) or `--host ::`
(IPv6-only, the default in slim containers where IPV6_V6ONLY=1) only satisfies
one of those, leaving the container unreachable on the other and producing edge
500s with no request logs.

This launcher builds a single IPv6 socket with IPV6_V6ONLY disabled, so it
accepts both IPv6 and IPv4-mapped traffic, then hands it to uvicorn.
"""
import os
import socket

import uvicorn

PORT = int(os.getenv("PORT", "8000"))


def _dual_stack_socket(port: int) -> socket.socket:
    sock = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    # Accept IPv4 as well as IPv6 (best-effort; not all platforms allow toggling).
    try:
        sock.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
    except (AttributeError, OSError):
        pass
    sock.bind(("::", port))
    sock.listen()
    return sock


if __name__ == "__main__":
    server_socket = _dual_stack_socket(PORT)
    config = uvicorn.Config("main:app", log_level="info")
    uvicorn.Server(config).run(sockets=[server_socket])
