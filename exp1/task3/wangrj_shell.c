#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

#define CMD_MAX 128
#define ARG_MAX 64

// 彩色命令提示符
#define PROMPT_BASE "WangRJ-Shell> "
const char PROMPT[] = "\e[1;36m" PROMPT_BASE "\e[0m";

// 输出错误提示
void printerr(int ptr, int newline)
{
    char c;
    // 等待换行符
    if (newline)
    {
        do
        {
            c = getchar();
        } while (c != '\n');
    }
    // 缩进
    for (int i = 0; i < ptr; i++)
    {
        fprintf(stderr, " ");
    }
    // 变成红色，指示位置
    fprintf(stderr, "\e[1;31m^\n");
    for (int i = 5; i < ptr; i++)
    {
        fprintf(stderr, " ");
    }
    // 输出提示
    fputs("错误：非法命令\e[0m\n\n", stderr);
}

// 获得有效字符
char getValidChar(int *ptr)
{
    char c;
    do
    {
        c = getchar();
        (*ptr)++;
    } while (isspace(c) && c != '\n');
    return c;
}

int main()
{
    char cmd[CMD_MAX];
    char c;
    int ptr = (sizeof(PROMPT_BASE)) / sizeof(char) - 2;
    char *argv[ARG_MAX] = {NULL};
    int argc = 1;
    int pid;
    int success;

    // 输出命令提示符
    printf(PROMPT);
    while (1)
    {
        argv[0] = NULL;

        // 输入命令名
        c = getValidChar(&ptr);
        if (c != '\n')
        {
            ungetc(c, stdin);
            ptr--;
            if (scanf("%[^ \t\n(),]", cmd) <= 0)
            {
                printerr(ptr + 1, 1);
            }
            else if (strcmp(cmd, "max") == 0)
            {
                argv[0] = "./max.out";
                ptr += (sizeof("max") - 1) / sizeof(char);
            }
            else if (strcmp(cmd, "min") == 0)
            {
                argv[0] = "./min.out";
                ptr += (sizeof("min") - 1) / sizeof(char);
            }
            else if (strcmp(cmd, "average") == 0)
            {
                argv[0] = "./average.out";
                ptr += (sizeof("average") - 1) / sizeof(char);
            }
            else if (strcmp(cmd, "exit") == 0)
            {
                exit(0);
            }
            else
            {
                printerr(ptr + 1, 1);
            }
        }

        if (argv[0] != NULL)
        {
            // 词法分析，解析参数
            c = getValidChar(&ptr);
            if (c != '(')
            {
                printerr(ptr, c != '\n');
            }
            else
            {
                success = 1;
                while (1)
                {
                    // 解析参数
                    argv[argc] = (char*) malloc(64);
                    argv[argc][0] = '\0';
                    c = getValidChar(&ptr);
                    ungetc(c, stdin);
                    ptr--;
                    scanf("%[^ \t\n,())]", argv[argc]);
                    ptr += strlen(argv[argc]);
                    argc++;
                    c = getValidChar(&ptr);
                    if (c == ')')
                    {
                        c = getValidChar(&ptr);
                        if (c != '\n')
                        {
                            success = 0;
                            printerr(ptr, 1);
                        }
                        break;
                    }
                    else if (c != ',')
                    {
                        printerr(ptr, c != '\n');
                        success = 0;
                        break;
                    }
                }
                if (success)
                {
                    // 解析成功，执行命令
                    pid = fork();
                    if (pid == -1)
                    {
                        fputs("错误：fork失败", stderr);
                    }
                    else if (pid > 0)
                    {
                        wait(NULL);
                    }
                    else
                    {
                        execve(argv[0], argv, NULL);
                    }
                }
            }
        }

        // 释放空间
        while (argc > 1)
        {
            argc--;
            free(argv[argc]);
            argv[argc] = NULL;
        }

        // 输出命令提示符
        printf(PROMPT);
        ptr = (sizeof(PROMPT_BASE)) / sizeof(char) - 2;
    }
    return 0;
}
