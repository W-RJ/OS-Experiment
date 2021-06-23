#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

// 字符串转换成double
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
    double res = 0.0;
    int i;

    // 检查参数个数
    if (argc < 2)
    {
        fputs("\e[1;31m错误：参数过少\e[0m\n", stderr);
        return 1;
    }

    // 转化参数并计算
    for (i = 1; i < argc; i++)
    {
        res += str2d(argv[i]);
    }

    // 输出结果
    printf("答案 = %lf\n", res / (argc - 1));
    
    return 0;
}
