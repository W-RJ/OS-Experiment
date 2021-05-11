#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

double str2d(const char *str)
{
    int flag = 0;
    double res = 0;
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
    double m, n, l;
    if (argc < 4)
    {
        fputs("\e[31m错误：参数过少\e[0m\n", stderr);
        return 1;
    }
    else if (argc > 4)
    {
        fputs("\e[31m错误：参数过多\e[0m\n", stderr);
        return 1;
    }
    m = str2d(argv[1]);
    n = str2d(argv[2]);
    l = str2d(argv[3]);
    printf("答案 = %lf\n", (m + n + l) / 3);
    
    return 0;
}
