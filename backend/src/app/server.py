import argparse
from . import create_app

def start_server():
    parser = argparse.ArgumentParser()

    # API flag
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="The host to run the server",
    )
    parser.add_argument(
        "--port",
        default=5000,
        help="The port to run the server",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Run Flask in debug mode",
    )

    args = parser.parse_args()

    app = create_app()
    app.run(debug=args.debug, host=args.host, port=args.port)


if __name__ == "__main__":
    start_server()
