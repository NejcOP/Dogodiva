# Supabase Email Verification Removal

## Kaj narediti:

1. Pojdi na https://app.supabase.com
2. Izberi projekt **"Dogodiva"**
3. V levem meniju pojdi: **Authentication** → **Settings**
4. Pod **"Email Authentication"** iztroči:
   - ✅ **Uncheck** "Enable email confirmations" (Ali "Require email verification")
   - ✅ **Save**

## Rezultat:
- Uporabniki se bodo moglic registrirati **brez** e-mail potrditve
- Po registraciji bodo avtomatsko preusmerjeni na `/ponudniki` (Najdi ponudnike)

## Status:
- ✅ Frontend: `AuthPage.tsx` - Redirect že implementiran
- ⏳ Backend: Supabase Cloud - Čaká na ročno nastavitev (ali CLI avtomatizacijo)

## Alternativa (CLI automation):
Če imaš Supabase accessToken nastavljen, lahko uporabis:
```bash
supabase projects update --update-email-confirmations=false
```

## Test:
```
1. Opiši browser na http://localhost:5175
2. Klikni "Ustvari račun"
3. Izpolni obrazec
4. Klikni "Ustvari račun"
5. ✅ Avtomat preusmerjam na "Najdi ponudnike" (no email verification)
```
