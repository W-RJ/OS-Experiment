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
            fputs("\e[31m错误：非法参数\e[0m\n", stderr);
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
    long long m, n;
    if (argc < 3)
    {
        fputs("\e[31m错误：参数过少\e[0m\n", stderr);
        return 1;
    }
    else if (argc > 3)
    {
        fputs("\e[31m错误：参数过多\e[0m\n", stderr);
        return 1;
    }
    m = str2ll(argv[1]);
    n = str2ll(argv[2]);
    printf("答案 = %lld\n", m < n ? m : n);
    
    return 0;
}
