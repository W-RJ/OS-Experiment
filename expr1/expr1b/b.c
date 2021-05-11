#include <unistd.h>
#include <stdio.h>

int main()
{
    int pid1, pid2;
    pid1 = fork();
    if (pid1 == -1)
    {
        fputs("错误：fork失败\n", stderr);
        return 1;
    }
    else if (pid1 != 0)
    {
        pid2 = fork();
        if (pid2 == -1)
        {
            fputs("错误：fork失败\n", stderr);
            return 1;
        }
        else if (pid2 != 0)
        {
            printf("本进程为父进程，本进程的pid=%d，子1进程的pid=%d，子2进程的pid=%d\n", getpid(), pid1, pid2);
        }
        else
        {
            printf("本进程为子2进程，本进程的pid=%d\n", getpid());
        }
    }
    else
    {
        printf("本进程为子1进程，本进程的pid=%d\n", getpid());
    }
    return 0;
}
