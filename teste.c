#include <stdio.h>

int main() {
    int matriz[10][10], vetor[100];
    int i, j, k = 0;

    for (i = 0; i < 10; i++) {
        for (j = 0; j < 10; j++) {
            printf("Digite o valor para matriz[%d][%d]: ", i, j);
            scanf("%d", &matriz[i][j]);
        }
    }

    for (i = 0; i < 10; i++) {
        for (j = 0; j < 10; j++) {
            vetor[k] = matriz[i][j];
            k++;
        }
    }

    printf("\nVetor gerado a partir da matriz:\n");
    for (i = 0; i < 100; i++) {
        printf("vetor[%d] = %d\n", i, vetor[i]);
    }

    return 0;
}
