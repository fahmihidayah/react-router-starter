pipeline {
    agent any

    options {
        skipDefaultCheckout()
    }

    environment {
        // Project image. Change this only if the GHCR owner or repository changes.
        IMAGE_NAME = 'ghcr.io/fahmihidayah/learning-tracker'

        // CHANGE_ME: Staging VPS connection and application directory.
        STAGING_VPS_USER = 'ubuntu'
        STAGING_VPS_HOST = '124.156.207.229'
        STAGING_VPS_APP_DIR = '/home/ubuntu/learning-tracker'

        // CHANGE_ME: Production VPS connection and application directory.
        PROD_VPS_USER = 'ubuntu'
        PROD_VPS_HOST = '124.156.207.229'
        PROD_VPS_APP_DIR = '/home/ubuntu/learning-tracker'

        // Extract semantic version from git tag (e.g., staging/1.0.0 → 1.0.0)
        VERSION = sh(
            script: "echo ${env.TAG_NAME} | sed 's|^staging/||' | sed 's|^prod/||'",
            returnStdout: true
        ).trim()
    }

    stages {
        stage('Checkout') {
            when {
                anyOf {
                    tag pattern: '^staging/[0-9]+[.][0-9]+[.][0-9]+$', comparator: 'REGEXP'
                    tag pattern: '^prod/[0-9]+[.][0-9]+[.][0-9]+$', comparator: 'REGEXP'
                }
            }
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            when {
                tag pattern: '^staging/[0-9]+[.][0-9]+[.][0-9]+$', comparator: 'REGEXP'
            }
            steps {
                script {
                    echo "Building Docker images for version ${VERSION}"
                }
                sh '''
                    # Build runner image
                    docker build \
                      --target runner \
                      -t "$IMAGE_NAME:$VERSION" \
                      -t "$IMAGE_NAME:latest" .

                    # Build migrator image
                    docker build \
                      --target migrator \
                      -t "$IMAGE_NAME:$VERSION-migrate" \
                      -t "$IMAGE_NAME:latest-migrate" .
                '''
            }
        }

        stage('Push Images to GHCR') {
            when {
                tag pattern: '^staging/[0-9]+[.][0-9]+[.][0-9]+$', comparator: 'REGEXP'
            }
            steps {
                withCredentials([usernamePassword(
                    // CHANGE_ME: create a Username with password credential containing
                    // your GitHub username and a token with permission to write packages.
                    credentialsId: 'ghcr-credentials',
                    usernameVariable: 'GHCR_USER',
                    passwordVariable: 'GHCR_TOKEN'
                )]) {
                    sh '''
                        echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

                        echo "Pushing version $VERSION to GHCR"
                        docker push "$IMAGE_NAME:$VERSION"
                        docker push "$IMAGE_NAME:latest"
                        docker push "$IMAGE_NAME:$VERSION-migrate"
                        docker push "$IMAGE_NAME:latest-migrate"
                    '''
                }
            }
        }

        stage('Verify Production Image Exists') {
            when {
                tag pattern: '^prod/[0-9]+[.][0-9]+[.][0-9]+$', comparator: 'REGEXP'
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'ghcr-credentials',
                    usernameVariable: 'GHCR_USER',
                    passwordVariable: 'GHCR_TOKEN'
                )]) {
                    script {
                        echo "Verifying that image $VERSION exists in GHCR before production deployment"
                        def imageExists = sh(
                            script: """
                                echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
                                docker pull "$IMAGE_NAME:$VERSION" && docker pull "$IMAGE_NAME:$VERSION-migrate"
                            """,
                            returnStatus: true
                        )

                        if (imageExists != 0) {
                            error("Image version $VERSION not found in GHCR. You must deploy to staging first (staging/$VERSION) before deploying to production (prod/$VERSION).")
                        }

                        echo "✓ Image version $VERSION verified in GHCR"
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                tag pattern: '^staging/[0-9]+[.][0-9]+[.][0-9]+$', comparator: 'REGEXP'
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'ghcr-credentials',
                    usernameVariable: 'GHCR_USER',
                    passwordVariable: 'GHCR_TOKEN'
                )]) {
                    // CHANGE_ME: replace this with the ID of the staging VPS SSH private-key credential.
                    sshagent(credentials: ['staging-vps-ssh-key']) {
                        sh '''
                        echo "Deploying version $VERSION to STAGING environment"

                        # Copy production docker-compose to staging VPS
                        scp -o StrictHostKeyChecking=no docker-compose.prod.yml \
                          "$STAGING_VPS_USER@$STAGING_VPS_HOST:$STAGING_VPS_APP_DIR/docker-compose.prod.yml"

                        # Deploy to staging VPS
                        ssh -o StrictHostKeyChecking=no "$STAGING_VPS_USER@$STAGING_VPS_HOST" \
                          "GHCR_USER='$GHCR_USER' GHCR_TOKEN='$GHCR_TOKEN' IMAGE_NAME='$IMAGE_NAME' VERSION='$VERSION' STAGING_VPS_APP_DIR='$STAGING_VPS_APP_DIR' bash -s" << 'ENDSSH'
                          set -e
                          cd "$STAGING_VPS_APP_DIR"

                          echo "Logging into GHCR on staging VPS..."
                          echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

                          echo "Pulling images version $VERSION..."
                          IMAGE_NAME="$IMAGE_NAME" IMAGE_TAG="$VERSION" docker compose -f docker-compose.prod.yml --profile tools pull app migrate

                          echo "Running database migrations..."
                          IMAGE_NAME="$IMAGE_NAME" IMAGE_TAG="$VERSION" docker compose -f docker-compose.prod.yml --profile tools run --rm migrate

                          echo "Deploying application..."
                          IMAGE_NAME="$IMAGE_NAME" IMAGE_TAG="$VERSION" docker compose -f docker-compose.prod.yml up -d --no-build --remove-orphans --force-recreate

                          echo "Waiting for health check..."
                          sleep 10
                          docker compose -f docker-compose.prod.yml ps

                          echo "Cleaning up old images..."
                          docker image prune -f

                          echo "✓ Staging deployment completed successfully!"
                          echo "Version $VERSION is now running on staging"
ENDSSH
                        '''
                    }
                }
            }
        }

//         stage('Deploy to Production') {
//             when {
//                 tag pattern: '^prod/[0-9]+[.][0-9]+[.][0-9]+$', comparator: 'REGEXP'
//             }
//             steps {
//                 withCredentials([usernamePassword(
//                     credentialsId: 'ghcr-credentials',
//                     usernameVariable: 'GHCR_USER',
//                     passwordVariable: 'GHCR_TOKEN'
//                 )]) {
//                     // CHANGE_ME: replace this with the ID of the VPS SSH private-key credential.
//                     sshagent(credentials: ['vps-ssh-key']) {
//                         sh '''
//                         echo "Deploying version $VERSION to PRODUCTION environment"
//                         echo "⚠️  This will deploy the SAME IMAGE tested in staging"

//                         # Copy production docker-compose to production VPS
//                         scp -o StrictHostKeyChecking=no docker-compose.prod.yml \
//                           "$PROD_VPS_USER@$PROD_VPS_HOST:$PROD_VPS_APP_DIR/docker-compose.prod.yml"

//                         # Deploy to production VPS
//                         ssh -o StrictHostKeyChecking=no "$PROD_VPS_USER@$PROD_VPS_HOST" \
//                           "GHCR_USER='$GHCR_USER' GHCR_TOKEN='$GHCR_TOKEN' IMAGE_NAME='$IMAGE_NAME' VERSION='$VERSION' PROD_VPS_APP_DIR='$PROD_VPS_APP_DIR' bash -s" << 'ENDSSH'
//                           set -e
//                           cd "$PROD_VPS_APP_DIR"

//                           echo "Logging into GHCR on production VPS..."
//                           echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

//                           echo "Pulling images version $VERSION..."
//                           IMAGE_NAME="$IMAGE_NAME" IMAGE_TAG="$VERSION" docker compose -f docker-compose.prod.yml --profile tools pull app migrate

//                           echo "Running database migrations..."
//                           IMAGE_NAME="$IMAGE_NAME" IMAGE_TAG="$VERSION" docker compose -f docker-compose.prod.yml --profile tools run --rm migrate

//                           echo "Deploying application with zero-downtime..."
//                           IMAGE_NAME="$IMAGE_NAME" IMAGE_TAG="$VERSION" docker compose -f docker-compose.prod.yml up -d --no-build --remove-orphans --force-recreate

//                           echo "Waiting for health check..."
//                           sleep 10
//                           docker compose -f docker-compose.prod.yml ps

//                           echo "Cleaning up old images..."
//                           docker image prune -f

//                           echo "✓ Production deployment completed successfully!"
//                           echo "Version $VERSION is now live in production"
// ENDSSH
//                         '''
//                     }
//                 }
//             }
//         }
    }

    post {
        always {
            sh 'docker logout ghcr.io || true'
        }
        success {
            script {
                if (env.TAG_NAME =~ /^staging\//) {
                    echo "╔════════════════════════════════════════════════════════╗"
                    echo "║  ✓ STAGING DEPLOYMENT SUCCESSFUL                      ║"
                    echo "║                                                        ║"
                    echo "║  Version: ${VERSION}                                  ║"
                    echo "║                                                        ║"
                    echo "║  Next steps:                                           ║"
                    echo "║  1. Test thoroughly on staging                         ║"
                    echo "║  2. When ready, promote to production with:            ║"
                    echo "║     git tag prod/${VERSION}                            ║"
                    echo "║     git push origin prod/${VERSION}                    ║"
                    echo "╚════════════════════════════════════════════════════════╝"
                } else if (env.TAG_NAME =~ /^prod\//) {
                    echo "╔════════════════════════════════════════════════════════╗"
                    echo "║  ✓ PRODUCTION DEPLOYMENT SUCCESSFUL                   ║"
                    echo "║                                                        ║"
                    echo "║  Version: ${VERSION} is now LIVE                      ║"
                    echo "║                                                        ║"
                    echo "║  The same Docker image tested in staging has been     ║"
                    echo "║  deployed to production.                               ║"
                    echo "╚════════════════════════════════════════════════════════╝"
                }
            }
        }
        failure {
            script {
                if (env.TAG_NAME =~ /^staging\//) {
                    echo "✗ Staging deployment failed for version ${VERSION}"
                } else if (env.TAG_NAME =~ /^prod\//) {
                    echo "✗ Production deployment failed for version ${VERSION}"
                    echo "⚠️  Production may still be running previous version"
                }
            }
        }
    }
}
