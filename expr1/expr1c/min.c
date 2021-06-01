#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

long long str2ll(const char *str)
{
    int flag = 0;
    long long res = 0;
    if (str[0] == '-')
    {
        flag = 1;
        str++;
    }
    else if (str[0] == '+')
    {
        str++;
    }
    do
    {
        if (!isdigit(*str))
        {
            fputs("\e[1;31m错误：非法参数\e[0m\n", stderr);
            exit(2);
        }
        res = res * 10 + *str - '0';
        str++;
    } while (*str);
    if (flag)
    {
        res = -res;
    }
    return res;
}

int main(int argc, char **argv)
{
    long long res, x;
    int i;
    if (argc < 2)
    {
        fputs("\e[1;31m错误：参数过少\e[0m\n", stderr);
        return 1;
    }
    res = str2ll(argv[1]);
    for (i = 2; i < argc; i++)
    {
        x = str2ll(argv[i]);
        res = res < x ? res : x;
    }
    printf("答案 = %lld\n", res);
    
    return 0;
}
