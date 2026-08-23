import uvicorn
import multiprocessing

if __name__ == '__main__':
    # Optimized for high concurrency, 100+ simultaneous users, zero timeout
    uvicorn.run(
        'app.main:app',
        host='0.0.0.0',
        port=8000,
        reload=False,
        workers=2,
        limit_concurrency=500,
        backlog=2048,
        timeout_keep_alive=65,
        access_log=False,
    )
