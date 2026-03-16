@echo off
chcp 65001 >nul
echo [1/4] 正在配置身份信息...
REM 这里已经帮你改好了，直接用就行
git config --global user.email "xyqiao98@gmail.com"
git config --global user.name "xyqiao98"

echo [2/4] 正在准备上传清单...
(
echo app/node_modules/
echo app/dist/
echo .DS_Store
echo *.pyc
) > .gitignore

echo [3/4] 正在本地打包代码...
git init
git add .
git commit -m "update website"

echo [4/4] 正在推送到 GitHub...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/xyqiao98-wq/Government-debt.git
git branch -M main
git push -u origin main --force

echo ---------------------------------------
echo 任务完成！请刷新 GitHub 页面查看。
pause