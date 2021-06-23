#include <unistd.h>
#include <stdio.h>

int main()
{
    // 第一次fork
    int pid = fork();
    if (pid == -1)
    {
        // 第一次fork失败
        fputs("错误：fork失败\n", stderr);
        return 1;
    }
    else if (pid != 0)
    {
        // 本进程为父进程
        printf("本进程为父进程，本进程的pid=%d，子1进程的pid=%d\n", getpid(), pid);
    }
    else
    {
        // 本进程为子1进程
        // 第二次fork
        pid = fork();
        if (pid == -1)
        {
            // 第二次fork失败
            fputs("错误：fork失败\n", stderr);
            return 1;
        }
        else if (pid != 0)
        {
            // 本进程为子1进程
            printf("本进程为子1进程，本进程的pid=%d，子2进程的pid=%d\n", getpid(), pid);
        }
        else
        {
            // 本进程为子2进程
            printf("本进程为子2进程，本进程的pid=%d\n", getpid());
        }
    }
    return 0;
}
