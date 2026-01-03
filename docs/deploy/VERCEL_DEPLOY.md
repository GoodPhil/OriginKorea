# 🚀 Vercel 배포 가이드 / Vercel Deployment Guide

## 📋 목차 / Table of Contents

1. [Vercel 계정 설정](#1-vercel-계정-설정)
2. [GitHub 저장소 연결](#2-github-저장소-연결)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [배포 시작](#4-배포-시작)

---

## 1. Vercel 계정 설정

### 한국어:
1. https://vercel.com 접속
2. "Sign Up" 클릭
3. **GitHub으로 로그인** 선택 (권장)
4. GitHub 계정 연결 승인

### English:
1. Go to https://vercel.com
2. Click "Sign Up"
3. Select **Continue with GitHub** (recommended)
4. Authorize GitHub connection

---

## 2. GitHub 저장소 연결

### 한국어:
1. Vercel 대시보드에서 **"Add New..." → "Project"** 클릭
2. "Import Git Repository" 섹션에서 **"GoodPhil/OriginKorea"** 선택
3. "Import" 클릭

### English:
1. In Vercel dashboard, click **"Add New..." → "Project"**
2. In "Import Git Repository" section, select **"GoodPhil/OriginKorea"**
3. Click "Import"

---

## 3. 환경 변수 설정 ⚠️ 중요!

### 한국어:

**배포 전에 반드시 환경 변수를 설정해야 합니다!**

1. "Configure Project" 화면에서 **"Environment Variables"** 섹션 찾기
2. 다음 변수들을 추가:

| Name | Value |
|------|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://your-project.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | your-anon-key |
| NEXT_PUBLIC_ADMIN_EMAIL | goodphil@gmail.com |

**Supabase 키 찾는 방법:**
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. Settings → API
4. **Project URL**과 **anon public** 키 복사

---

## 4. 배포 시작

### 한국어:
1. 환경 변수 설정 완료 후 **"Deploy"** 클릭
2. 배포 진행 상황 확인 (약 1-3분 소요)
3. 성공 시 배포 URL 확인

---

## ⚡ 빠른 배포 요약

1. https://vercel.com/new 접속
2. GoodPhil/OriginKorea 선택
3. 환경 변수 설정
4. Deploy 클릭!

---

**Made with ❤️ by PHIL**
