# Mobile e APK

## Tecnologia

O projeto usa Capacitor para empacotar o frontend como aplicativo Android.

## Comandos Principais

```powershell
npm run build
npm run cap:sync
npx cap open android
```

Atalho ja configurado:

```powershell
npm run android
```

## Requisitos

- JDK instalado ou Java configurado
- Android Studio
- SDK Android configurado

No ambiente atual, uma configuracao valida de Java no Windows pode usar o JBR do Android Studio.

Exemplo:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
java -version
```

## Local do APK

Geralmente:

[C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\android\app\build\outputs\apk\debug\app-debug.apk](C:\Users\brito\OneDrive\Documentos\terra-viva-link-main\terra-viva-link-main\android\app\build\outputs\apk\debug\app-debug.apk)

## Observacoes de Build

O projeto foi ajustado para gerar `dist/client/index.html`, necessario para o Capacitor.

## Fluxo Recomendado

1. Rodar `npm run build`
2. Rodar `npm run cap:sync`
3. Abrir Android Studio com `npx cap open android`
4. Gerar APK debug

## Limites Atuais

- O app mobile embute o frontend
- O Supabase continua sendo acessado online
- O banco nao vai junto dentro do APK
